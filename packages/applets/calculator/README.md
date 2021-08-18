# Calculator

A simple calculator applet.

## Long term goals:

-   Add an API to allow for 3rd party plugins to extend Calculator Applet with custom functions, units and constants.
-   Add a plotter?

## Decisions

-   Feature request: Ability to use `,` as a decimal seperator.
    -   One suggested approach is to convert `,` into `.` ahead of time however:
        -   `,` is also used for parameter syntax: `pow(1,2)` would map to `pow(1.2)` if all `,`s were replaced to `.`.
        -   You can get around this by making another character e.g. `;` the parameter seperator `pow(1;2)` but you may have other syntax conflicts e.g. Matrix seperator.
        -   Users will always have to keep this syntax change in mind, leading to a poor user experience.
        -   Suggestions from other users on a forum "Use this expression instead! ..." Will perhaps not work due to the user's settings.
    -   **Our decision:** This is something which may be taken into consideration Long Term RE: support for different languages other than English. But will not be included at present.
-   Feature request: Custom mathematics parser
    -   We were originally planning on using a custom mathematics parser. [We started on such a project here](https://github.com/LaunchMenu-archive/unitary-math-parser).
    -   Pros vs cons
        -   Pros of unitary-math-parser:
            -   General syntax error recover feature
            -   Date formats
            -   Has `as` syntax
            -   Easily allows custom syntax
            -   Implicit multiplication is a higher priority than Explicit multiplication and division (e.g. `3kg / 2m` == `(3kg) / (2m)` instead of `(3kg/2)m` as in mathJS)
            -   We can make sure that our syntax focusses on common simple use cases (which is the goal of this applet), rather than advanced mathematical concepts
        -   Cons of unitary-math-parser:
            -   Code started to get messy
            -   Initial design decisions not holding water
        -   Pros of mathjs:
            -   Well maintained (less buggy)
            -   Popular (potential benefits to UX here)
            -   Has a good operator overloading system
            -   Has support for more types, units, constants and functions out of the box
            -   Has integration and derivatives support
        -   Cons of mathjs:
            -   Uses `%` for modulo operator instead of percentage.
            -   Doesn't support custom syntax (as far as we know)
            -   Some confusing choices like `[a,b] * transpose([c,d])` taking the dot product instead of cross.
            -   TypeScript integration isn't great (it is written in JavaScript, and the type definitions aren't fabulous)
            -   `in` is an alias for `inches` which can be confusing. E.G: `4m in` == `... in^2`
        -   Neutral mathjs:
            -   Supports most of the functionality we wanted anyway:
                -   Calculations with units
                -   custom base units
                -   custom derived units
                -   custom functions
                -   custom constants
                -   Number formats (binary, hex, oct)
    -   **Our decision:** Will use MathJS for now, and keep a more limited feature set. In the future we will likely still update to our own parser however, since there isn't an awful lot to be maintained to begin with.
