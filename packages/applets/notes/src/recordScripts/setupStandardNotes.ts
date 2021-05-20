import {LaunchMenu} from "@launchmenu/core";
import {setupNotes} from "./setupNotes";
import Path from "path";

/**
 * Sets up the standard notes to be displayed
 * @param LM The LaunchMenu instance to retrieve data from
 * @returns A function that can be invoked to restore the previous notes
 */
export async function setupStandardNotes(LM: LaunchMenu): Promise<() => Promise<void>> {
    return setupNotes({
        LM,
        notes: [
            {
                name: "Todo",
                content: "- feed the cat \n- buy trash bags",
                syntaxMode: "markdown",
            },
            {
                name: "Scratch pad",
                content:
                    "(id x id) o (f x f)\n = (id o f) x (id o f)\n = f x f\n = id o (f x f)\n \n if (f x f) is surjective, then (id x id) = id.\n there exist choices for f that make (f x f) surjective for any codomain (e.g. f = id), hence (id x id) = id. QED",
                showRichContent: false,
            },
            {
                name: "Physics cheat sheet",
                content: `![Force](${Path.join(
                    __dirname,
                    "..",
                    "..",
                    "recording%20images",
                    "forces.jpg"
                )}) \n - Average speed: $$ S = \\frac{d}{t} $$\n- Acceleration: $$ a = \\frac{v-u}{t} $$ \n- Newton's second law: $$ F = m × a $$ \n- Kinetic energy: $$ E = \\frac{1}{2}mv^2 $$`,
                syntaxMode: "markdown",
                categoryID: "school",
            },
            {
                name: "Linear algebra cheat sheet",
                content: `# Matrix norm properties \n Same as vector: \n - $$ ||A+B|| \\leq ||A|| + ||B|| $$ \n - $$ ||\\alpha\\cdot A||=|\\alpha|\\cdot||A||\\text{ if }\\alpha \\in \\mathbb{R} $$ \n - $$ ||A||=0 \\Leftrightarrow A=O $$ \n - $$ ||A||\\geq0 $$ \n \n Matrix specific: \n - $$ ||Ax|| \\leq ||A||\\cdot||x|| $$ \n - $$ ||A\\cdot B|| \\leq ||A||\\cdot||B|| $$ `,
                syntaxMode: "markdown",
                categoryID: "school",
            },
            {
                name: "Lambda.js",
                content: lambdajs,
                syntaxMode: "javascript",
                categoryID: "code",
            },
            {
                name: "Temperature converter",
                content: temperatureConverter,
                syntaxMode: "html",
            },
        ],
        categories: [
            {
                name: "School",
                ID: "school",
            },
            {
                name: "Code snippets",
                ID: "code",
            },
        ],
    });
}

const lambdajs = `/** Logic */
True = x=>y=>x
False = x=>y=>y

iff = c=>t=>f=>c(t)(f)
lazyIf = c=>t=>f=>c(t)(f)()  // Js evualuation isn't lazy, but it can be simulated by providing callback functions
not = f=>x=>y=>f(y)(x)
and = x=>y=>x(y)(x)
or = x=>y=>x(x)(y)

/** Pairs */
Pair = x=>y=>f=>f(x)(y)
first = t=>t(True)
second = t=>t(False)

/** Lists */
Nil = n=>c=>n
Cons = x=>y=>n=>c=>c(x)(y)
isEmpty = l=>l(True)(()=>()=>False)
head = l=>l(l)(True) // First param doesn't matter
tail = l=>l(l)(False) // First param doesn't matter
fold = b=>s=>l=>F(r=>l=>lazyIf(isEmpty(l))(()=>b)(()=>s(head(l))(r(tail(l)))))(l)
concat = a=>b=>fold(b)(Cons)(a)

/** Numbers */
V0 = f=>b=>b
V1 = f=>b=>f(b)
V2 = f=>b=>f(f(b))
V3 = f=>b=>f(f(f(b)))
V4 = f=>b=>f(f(f(f(b))))
// ...etc

isZero = n=>n(()=>False)(True)
add1 = n=>f=>b=>f(n(f)(b))
sub1 = n=>f=>b=>first(n(v=>Pair(second(v))(f(second(v))))(Pair(b)(b)))

add = n=>m=>f=>b=>m(f)(n(f)(b))
mul = n=>m=>f=>b=>m(n(f))(b)
pow = n=>m=>f=>b=>m(n)(f)(b)

sub = n=>m=>f=>b=>m(sub1)(n)(f)(b)
div = n=>m=>F(r=>n=>(s=>lazyIf(isZero(s))(()=>V0)(()=>add1(r(s))))(sub(n)(m)))(add1(n))

/** Recursion using fixpoints */
F = f=>(x=>a=>f(x(x))(a))(x=>a=>f(x(x))(a)) // Usually is f=>(x=>f(x(x)))(x=>f(x(x))) which only works under lazy evaluation

/** Example program like functions */
fib = n=>first(n(x=>Pair(second(x))(add(first(x))(second(x))))(Pair(V0)(V1)))
fac = F(r=>n=>lazyIf(isZero(n))(()=>V1)(()=>mul(n)(r(sub1(n))))) // Have to use lazyIf to prevent infinite recursion
fac2 = n=>first(n(x=>Pair(mul(first(x))(second(x)))(add1(second(x))))(Pair(V1)(V1))) // Alternative definition using a paramorphism

partition = p=>fold(Pair(Nil)(Nil))(h=>t=>iff(isZero(sub(h)(p)))(Pair(Cons(h)(first(t)))(second(t)))(Pair(first(t))(Cons(h)(second(t)))))
quicksort = F(r=>l=>lazyIf(isEmpty(l))(()=>Nil)(()=>l(l)(h=>t=>(p=>concat(r(first(p)))(concat(Cons(h)(Nil))(r(second(p)))))(partition(h)(t)))))

/** Helpers to reveal hidden function structure by converting to and from js data */
V = fromJsNumber = n=>new Array(n).fill().reduce(add1, V0);
toJsNumber = n=>n(v=>v+1)(0);
fromJsArray = ar=>ar.reduceRight((cur, val)=>Cons(val)(cur), Nil);
toJsArray = l=>{
    const out = [];
    while(!isTrue(isEmpty(l))){
        out.push(head(l));
        l = tail(l);
    }
    return out;
}
isTrue = b=>b(true)(false);

fromJsNumberArray = ar=>fromJsArray(ar.map(v=>V(v)));
toJsNumberArray = l=>toJsArray(l).map(v=>toJsNumber(v));
`;

const temperatureConverter = `<html>
<head>
</head>
<body>
    <p>Convert Temperature</p>
    <input type=text id=temp>
    <br><input type="button" id=ctof value="to °F"> <input type="button"  id=ctof2 value="to °C"><br/>
    <output></output>
</body>
<script>
    var temperatures = function(t) {
        var output, given, result, opposite;
        given = document.getElementById('temp').value;
        if (t === "C") {
            result = 1.8 * (+given) + 32;
            opposite = "F";
        } else {
            result = (given - 32) / 1.8;
            opposite = "C";
        }
        if (result % 1 !== 0) {
            console.log(result % 1);
            result = result.toFixed(2);
        }
        if (given || given === "0") {
            output = given + " \\u00b0" + t + " is equal to " + result + " \\u00b0" + opposite;
        } else {
            output = "error: number expected";
        }
        document.querySelector('output').innerHTML = output;
    }
    document.getElementById('ctof').addEventListener('click', function(){temperatures('C');})
    document.getElementById('ctof2').addEventListener('click', function(){temperatures('F');})
</script>
</html>`;
