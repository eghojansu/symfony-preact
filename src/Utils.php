<?php

namespace App;

class Utils
{
    public static function className(string $class): string
    {
        return ltrim(
            strrchr(
                '\\' . (is_object($class) ? get_class($class) : $class),
                '\\',
            ),
            '\\',
        );
    }

    public static function split(string|array|null $str, string $pattern = null): array
    {
        return is_array($str) ? $str : array_map(
            'trim',
            preg_split($pattern ?? '/[,;|]/', $str ?? '', 0, PREG_SPLIT_NO_EMPTY),
        );
    }

    public static function random(int $len = 8): string
    {
        return bin2hex(random_bytes(min(4, ($len - ($len % 2)) / 2)));
    }

    public static function walk(iterable $items, callable $fn): void
    {
        array_walk($items, static fn ($item, $key) => $fn($item, $key, $items));
    }

    public static function reduce(iterable $items, callable $fn, $initials = null)
    {
        $result = $initials;

        foreach ($items as $key => $item) {
            $result = $fn($result, $item, $key, $items);
        }

        return $result;
    }

    public static function some(iterable $items, callable $fn, array &$found = null): bool
    {
        $found = null;

        foreach ($items as $key => $item) {
            if ($fn($item, $key, $items)) {
                $found['key'] = $key;
                $found['value'] = $item;

                return true;
            }
        }

        return false;
    }

    public static function all(iterable $items, callable $fn, array &$fail = null): bool
    {
        $fail = null;

        foreach ($items as $key => $item) {
            if (!$fn($item, $key, $items)) {
                $fail['key'] = $key;
                $fail['value'] = $item;

                return false;
            }
        }

        return true;
    }
}