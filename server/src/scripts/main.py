import sys


def print_to_stdout(*xs):
    print(*xs, file=sys.stdout)


def print_to_stderr(*xs):
    print(*xs, file=sys.stderr)


print_to_stdout("Hello world")
