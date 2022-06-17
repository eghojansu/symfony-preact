<?php

namespace App\Command;

use App\Utils;
use Symfony\Component\Yaml\Yaml;
use SebastianBergmann\Timer\Timer;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'dev:lazy',
    description: 'Lazy developer!',
)]
class DevLazyCommand extends Command
{
    protected function configure(): void
    {
        $this
            ->addArgument('groups', InputArgument::OPTIONAL|InputArgument::IS_ARRAY, 'Action group to execute')
            ->addOption('excludes', 'x', InputOption::VALUE_OPTIONAL|InputOption::VALUE_IS_ARRAY, 'Excluded actions')
            ->addOption('dry', 'd', InputOption::VALUE_NONE, 'Show steps only')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $check = $io->askHidden('What?');

        if ('dev' !== $this->projectEnv || $check !== ($this->data['lazy'] ?? Utils::random())) {
            $io->warning('Please stop! Just stop...');

            return Command::SUCCESS;
        }

        $time = new Timer();
        $time->start();

        $groups = self::quote($input->getArgument('groups'));
        $excludes = self::quote($input->getOption('excludes'));
        $actions = $this->getActions($groups, $excludes);

        if ($input->getOption('dry')) {
            $output->writeln('Available actions:');

            array_walk($actions, static fn (string ...$args) => (
                $output->writeln(sprintf(
                    '  - <info>%s</>',
                    $args[1],
                ))
            ));

            if (!$actions) {
                $output->writeln('  <comment>None</>');
            }

            return self::SUCCESS;
        }

        $success = null;
        $executed = 0;
        $total = count($actions);
        $run = fn ($method) => match($method) {
            '_01Seed01Seed' => $this->_01Seed01Seed($output),
            default => false,
        } ?? true;
        $separate = static fn () => $output->writeln(str_repeat('-', 50));

        array_walk(
            $actions,
            static function (
                string $method,
                string $action,
            ) use (
                &$success,
                &$executed,
                $total,
                $run,
                $time,
                $io,
                $separate,
            ) {
                if (false === $success) {
                    return;
                }

                $time->start();

                $separate();
                $io->writeln(sprintf(
                    'Running <comment>%s</> (<comment>%s</>/<comment>%s</>)',
                    $action,
                    ++$executed,
                    $total,
                ));

                $success = $run($method);

                $io->newLine();
                $io->writeln(sprintf(
                    '-- End running <comment>%s</> (<comment>%s</>)',
                    $action,
                    $time->stop()->asString(),
                ));
            },
        );

        list($tag, $message) = match($success) {
            true => array('info', 'Successful'),
            false => array('error', 'Failed'),
            default => array('comment', 'None executed'),
        };

        $io->newLine();
        $io->writeln(sprintf(
            'Action performed: <comment>%s</>/<comment>%s</>',
            $executed,
            $total,
        ));
        $io->writeln(sprintf(
            'Elapsed: <comment>%s</>',
            $time->stop()->asString(),
        ));
        $io->writeln(sprintf(
            'Summary Result: <%s>%s</>',
            $tag,
            $message,
        ));

        return Command::SUCCESS;
    }

    private static function quote(array $values): string
    {
        return $values ? '(' . implode('|', array_map(
            static fn (string $val) => preg_quote($val, '/'),
            $values,
        )) . ')' : '';
    }

    private function getActions(string $groups, string $excludes): array
    {
        $start = '/^_(\d+)';
        $end = '/i';
        $includes = $groups ? $start . $groups . $end : '';
        $ignores = $excludes ? $start . $groups . $excludes . '$' . $end : '';
        $methods = get_class_methods($this);
        $actions = $includes ? (
            ($founds = preg_grep($includes, $methods)) && $ignores ?
                array_filter(
                    $founds,
                    static fn (string $method) => !preg_match(
                        $ignores,
                        $method,
                    ),
                ) :
                $founds
        ) : array();

        sort($actions);

        return array_combine(
            array_map(
                static fn (string $action) => preg_replace(
                    $start . $groups . '(\d+)' . $end,
                    '',
                    $action,
                ),
                $actions,
            ),
            $actions,
        );
    }

    private function _01Seed01Seed(OutputInterface $output)
    {
        $this->call($output, 'doctrine:schema:drop', array(
            '--force' => true,
        ));
        $this->call($output, 'doctrine:schema:create');
        $this->call($output, 'doctrine:fixtures:load', array(
            '--append' => true,
        ));
    }

    private function call(
        OutputInterface $output,
        string $cmdName,
        array $cmdArgs = null,
    ): int {
        $command = $this->getApplication()->find($cmdName);
        $input = new ArrayInput($cmdArgs ?? array());

        return $command->run($input, $output);
    }

    private $data = array();

    public function __construct(
        private string $projectDir,
        private string $projectEnv,
        string $name = null,
    ) {
        parent::__construct($name);

        $this->data = Yaml::parseFile($projectDir . '/dev/data.yaml');
    }
}