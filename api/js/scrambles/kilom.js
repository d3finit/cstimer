/* kilosolver.js - A kilominx solver
version 0.3 (2016-12-20)
Copyright 2016; you may do anything (anything!) not covered by copyright law (because this is not an
EULA, duh?). You may also copy, modify, publish, distribute, sublicense or sell copies of this code,
subject to the inclusion of this copyright notice in all copies or substantial portions of the code.

(basically the MIT licence but with cruft removed, because who reads that shit)

This is a port of the kilominx solver originally written in Python with a few minor optimisations.

How to run this:
(0) Save this file somewhere.
(1) Install any JavaScript shell and run it with this file.
(2) Type stuff into the shell.

(or just use the HTML interface! it exists now!)

There is currently not much of a public interface. Useful stuff:
cache_all_tables()
    to generate all the lookup tables
print_move_sequence(generate_random_state_scramble())
    to get a random-state scramble
print_move_sequence(generate_hybrid_scramble())
    to get a hybrid random-move scramble

For the full solver (used in the random-state scrambler), a few hundred megabytes of RAM may be used
for the lookup tables, which will also take roughly a minute to generate. Once generated, each solve
takes roughly 0.08 second.

The hybrid scrambler uses much smaller lookup tables that take less memory and are generated faster,
but produces somewhat longer scramble sequences and isn't fully random-state. It should nevertheless
be good enough for non-competition purposes.

On the to-do list:
- optimise the heck out of the lookup table generation
- a GUI for the solver
- optimise the solver with colour neutrality and NISS(tm) techniques
- throw all the global variables into a namespace
*/

'use strict';

function counter(A)
{
    let counts = [];
    for (let a of A) counts[a] = (counts[a] || 0) + 1;
    return counts;
}

/* Combinatoric functions */

function factorial(n)
{
    if (n < 2) return n;
    let f = 1;
    for (let i = 2; i <= n; i++) f *= i;
    return f;
}

function C(n, k)
{
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let c = 1;
    for (let i = 0; i < k; i++)
    {
        c = (c * (n-i) / (i+1)) | 0;
    }
    return c;
}

function permutation_to_index(perm)
{
    perm = perm.slice();
    let n = perm.length;
    let f = factorial(n-1);
    let ind = 0;
    while (n > 1)
    {
        n--;
        // invariant: f == factorial(n)
        // also, perm stores meaningful values up to perm[n]
        let e = perm[0];
        ind += e * f;
        for (let i = 0; i < n; i++)
        {
            let x = perm[i+1];
            perm[i] = x - (x > e);
        }
        f /= n;
    }
    return ind;
}

function index_to_permutation(ind, n)
{
    let perm = [];
    let f = factorial(n-1);
    for (let i = 0; i < n; i++)
    {
        perm[i] = (ind / f) | 0;
        ind %= f;
        f /= n-1-i;
    }
    // could probably use some kind of binary tree to make this linearithmic, but I am hella lazy.
    for (let i = n-2; i >= 0; i--)
    {
        for (let j = i+1; j < n; j++)
        {
            perm[j] += +(perm[j] >= perm[i]);
        }
    }
    return perm;
}

function permutation_parity(A)
{
    let n = A.length;
    let parity = 0;
    // again, there is a linearithmic algorithm to count inversions, but >lazy
    for (let i = 0; i < n-1; i++)
    {
        for (let j = i; j < n; j++)
        {
            if (A[i] > A[j]) parity ^= 1;
        }
    }
    return parity;
}

function index_to_evenpermutation(ind, n)
{
    let perm = [];
    let f = factorial(n-1) / 2;
    let parity = 0;
    for (let i = 0; i < n-1; i++)
    {
        perm[i] = (ind / f) | 0;
        ind %= f;
        f /= n-1-i;
    }
    perm[n-1] = 0;
    for (let i = n-2; i >= 0; i--)
    {
        for (let j = i+1; j < n; j++)
        {
            if (perm[j] >= perm[i]) perm[j]++;
            else parity ^= 1;
        }
    }
    if (parity === 1) [perm[n-2], perm[n-1]] = [perm[n-1], perm[n-2]];
    return perm;
}

function evenpermutation_to_index(perm)
{
    return permutation_to_index(perm) >> 1;
}

function comb_to_index(l)
{
    let bits = l.length;
    let ones = 0;
    for (let i = 0; i < bits; i++) ones += +(l[i] === 1);
    let zeros = bits - ones;
    if (zeros === 0 || ones === 0 || bits === 1) return 0;
    let b = C(bits-1, ones);
    let ind = 0;
    for (let i = 0; zeros > 0 && ones > 0 && bits > 1; i++)
    {
        bits--;
        if (l[i] === 0)
        {
            b = b * --zeros / bits;
        }
        else // l[i] === 1
        {
            ind += b;
            b = b * ones-- / bits;
        }
    }
    return ind;
}

function index_to_comb(ind, ones, bits)
{
    let zeros = bits - ones;
    let b = C(bits-1 , ones);
    let l = [];
    let n = bits-1;
    for (let i = 0; i < n; i++)
    {
        bits--;
        if (ind < b)
        {
            l.push(0);
            b = b * --zeros / bits;
        }
        else
        {
            l.push(1);
            ind -= b;
            b = b * ones-- / bits;
        }
    }
    l.push(ones);
    return l;
}

function compose(A, B)
{
    let C = [];
    for (let i = 0; i < B.length; i++) C[i] = A[B[i]];
    return C;
}

function compose_o(A, B)
{
    // note: we hardcode the modulus to 3 here, because ~optimisations~
    // (unnecessary abstraction is bad, actually)
    let p = compose(A[0], B[0]);
    let o = [];
    let n = B[0].length;
    for (let i = 0; i < n; i++)
    {
        o[i] = (A[1][B[0][i]] + B[1][i]) % 3;
    }
    return [p, o];
}

function permutation_from_cycle(cycle, n)
{
    let perm = [];
    for (let i = 0; i < n; i++) perm[i] = i;
    for (let i = 0; i < cycle.length; i++)
    {
        perm[cycle[i]] = cycle[(i + 1) % cycle.length];
    }
    return perm;
}

function unsparsify_list(d, n)
{
    let l = Array(n).fill(0);
    for (let k in d) l[k] = d[k];
    return l;
}

/* The basic moves */

let move_U = [permutation_from_cycle([0, 1, 2, 3, 4], 20), unsparsify_list({}, 20)];
let move_R = [permutation_from_cycle([4, 3, 11, 12, 13], 20), unsparsify_list({4: 2, 3: 1, 11: 1, 12: 1, 13: 1}, 20)];
let move_F = [permutation_from_cycle([3, 2, 9, 10, 11], 20), unsparsify_list({3: 2, 2: 1, 9: 1, 10: 1, 11: 1}, 20)];
let move_L = [permutation_from_cycle([2, 1, 7, 8, 9], 20), unsparsify_list({2: 2, 1: 1, 7: 1, 8: 1, 9: 1}, 20)];
let move_BL = [permutation_from_cycle([1, 0, 5, 6, 7], 20), unsparsify_list({1: 2, 0: 1, 5: 1, 6: 1, 7: 1}, 20)];
let move_BR = [permutation_from_cycle([0, 4, 13, 14, 5], 20), unsparsify_list({0: 2, 4: 1, 13: 1, 14: 1, 5: 1}, 20)];
let move_x2 = [[15, 16, 17, 18, 19, 10, 9, 8, 7, 6, 5, 14, 13, 12, 11, 0, 1, 2, 3, 4], unsparsify_list({}, 20)];
let move_y = [[1, 2, 3, 4, 0, 7, 8, 9, 10, 11, 12, 13, 14, 5, 6, 19, 15, 16, 17, 18], unsparsify_list({}, 20)];

let moves = [move_U, move_R, move_F, move_L, move_BL, move_BR, move_x2];
let move_names = ['U', 'R', 'F', 'L', 'BL', 'BR', 'flip'];

let id = compose_o(move_x2, move_x2);

let moves_full = [];
for (let i = 0; i < moves.length; i++)
{
    moves_full[i] = [id];
    for (let j = 1; j < 5; j++) moves_full[i][j] = compose_o(moves_full[i][j-1], moves[i]);
}

function random_state()
{
    let p = [];
    for (let i = 0; i < 20; i++) p[i] = Math.floor(Math.random() * 1e10) * 20 + i;
    p.sort((x, y) => x - y);
    p = p.map(x => x % 20);
    if (permutation_parity(p) === 1) [p[0], p[1]] = [p[1], p[0]];
    let o = Array(20).fill(0);
    for (let i = 0; i < 19; i++)
    {
        o[i] = Math.floor(Math.random() * 3);
        o[19] += 3-o[i];
    }
    o[19] %= 3;
    return [p, o];
}

/* Human interface stuff */

function stringify_move_sequence(move_sequence)
{
    let suffixes = ["0", "", "2", "2'", "'"];
    let s = move_sequence.map(([m, r]) => (move_names[m] + suffixes[r]));
    return s.join(' ');
}

function print_move_sequence(move_sequence)
{
    console.log(stringify_move_sequence(move_sequence));
}

function apply_move_sequence(state, move_sequence)
{
    for (let [m, r] of move_sequence)
    {
        for (let i = 0; i < r; i++) state = compose_o(state, moves[m]);
    }
    return state;
}

function generate_random_state_scramble()
{
    return solve(random_state());
}

function generate_random_move_scramble()
{
    const NUM_FLIPS = 6, NUM_MOVES_BETWEEN_FLIPS = 6;
    // total number of moves = (NUM_FLIPS+1)(NUM_MOVES_BETWEEN_FLIPS+1)-1
    let move_sequence = [];
    for (let i = 0; i <= NUM_FLIPS; i++)
    {
        let last = -1, lastlast = -1;
        for (let j = 0; j < NUM_MOVES_BETWEEN_FLIPS; j++)
        {
            let m;
            while (true)
            {
                m = Math.floor(Math.random()*6);
                // don't output stuff like U2 U
                if (m === last) continue;
                // U move never commutes with the others
                else if (m === 0) break;
                // don't output stuff like L R L because L and R commute
                else if (m === lastlast && (m-last)*(m-last)%5 === 4) continue;
                else break;
            }
            // make 144-deg moves twice as likely as 72-deg moves
            move_sequence.push([m, 1+Math.round(Math.random()*3)]);
            [last, lastlast] = [m, last];
        }
        // flip after every set of moves on the hemisphere except the last because that would be
        // kind of pointless
        if (i < NUM_FLIPS) move_sequence.push([6, 1]);
    }
    return move_sequence;
}

/* a brief note on analysing random-move scrambles

Let M = num flips and N = num moves between flips.

Tracking just corner orientation is pretty much useless to determine if a scramble is good, at least
for the choice of CO reference used in the solver (<U,flip,(R'FRF')3>); even M=1, N=8 is good enough
to randomise the CO, despite leaving a bunch of obvious blocks.

Instead, we can track the location of, say, the white pieces. There are C(20, 5) combinations, so we
just try out a million random-move scrambles and do a chi-squared test. (Except I don't have a stats
package installed, so this is just a qualitative approximation.)

M=4, N=5 (29 moves): +2.7 stddev
M=3, N=8 (35 moves): +15.7 stddev
M=5, N=5 (35 moves): -0.1 stddev
M=4, N=7 (39 moves): +3.8 stddev
M=5, N=6 (41 moves): -0.4 stddev
M=4, N=8 (44 moves): +2.2 stddev

(the 95% confidence interval for these estimated values should be taken to be +-2, as usual)

Obviously we get closer to a uniform distribution with more moves, but we also want the scrambles to
be of a reasonable length. M=5, N=6 seems to be a good tradeoff.

This is until you realise that the five grey pieces are effectively scrambled with M reduced by one,
so we compensate for that by using M=6, N=6, which gives 48-move scrambles.

asdsadsf

(tl;dr: use the hybrid scrambler if you can stomach 0.3-second initialisation; don't use this)
*/

/* GUI stuff

The create_svg_template function returns an <svg> element with the facelets laid out neatly as a net
and the draw_state function fills in the colours given a state.

The input to the latter function does not have to be an <svg> element returned by the former, but it
must contain an element for each of the 60 facelets, with class 'loc%d_%d' % (i, j), where i is from
0 to 19 and j is either 0, 1 or 2.

j = 0 corresponds to the reference facelet (the one closest to perpendicular to the U-D axis), j = 1
corresponds to the one clockwise from the reference, and j = 2 corresponds to the one anticlockwise.

Other than the loc%d_%d classes, the facelet <polygon> elements also have the .facelet class and the
face outline <polygon> elements have the .face class, and may be customised with CSS. For example:

.face {stroke-linejoin: miter; stroke-width: 0.1;}

This can be used to make the corners sharp and the face outlines thicker; you get the idea.

TODO: figure out a sane way to handle changing colour scheme on the fly
(maybe tag the facelets with a separate class for each colour in addition to setting the fill)
*/

// colours copied from Kit's modded version of the Python scrambler, but with pale yellow made a bit
// darker.
let default_colour_scheme = {
    U:   '#ffffff',	// U (white)
    L:   '#57007f',	// L (purple)
    F:   '#007f0e',	// F (green)
    R:   '#ff0000',	// R (red)
    BR:  '#0026ff',	// BR (blue)
    BL:  '#ffd800',	// BL (yellow)
    DBR: '#ff82b8',	// DBR (pink)
    DB:  '#00ff21',	// DB (light green)
    DBL: '#ff6a00',	// DBL (orange)
    DFL: '#0094ff',	// DFL (light blue)
    DFR: '#ffff77',	// DFR (pale yellow)
    D:   '#808080',	// D (grey)
};

let face_names = ['U', 'L', 'F', 'R', 'BR', 'BL', 'DBR', 'DB', 'DBL', 'DFL', 'DFR', 'D'];

// return the face on which the loc_ori piece lies
function map_piece_to_face(loc, ori)
{
    ori = (ori%3 + 3)%3;
    let face = [
        ['U', 'BL', 'BR'], ['U', 'L', 'BL'], ['U', 'F', 'L'], ['U', 'R', 'F'], ['U', 'BR', 'R'],
        ['DB', 'BR', 'BL'], ['BL', 'DBL', 'DB'],
        ['DBL', 'BL', 'L'], ['L', 'DFL', 'DBL'],
        ['DFL', 'L', 'F'], ['F', 'DFR', 'DFL'],
        ['DFR', 'F', 'R'], ['R', 'DBR', 'DFR'],
        ['DBR', 'R', 'BR'], ['BR', 'DB', 'DBR'],
        ['D', 'DFL', 'DFR'], ['D', 'DBL', 'DFL'], ['D', 'DB', 'DBL'], ['D', 'DBR', 'DB'], ['D', 'DFR', 'DBR'],
    ][loc][ori];
    return face;
}

// how much to rotate a facelet (divided by 18 degrees) and where to draw it
let rotation_amounts = [
    [0, 3, 7], [8, 1, 5], [6, 9, 3], [4, 7, 1], [2, 5, 9],
    [0, 9, 1], [9, 0, 2],
    [2, 7, 9], [7, 2, 4],
    [4, 5, 7], [5, 4, 6],
    [6, 3, 5], [3, 6, 8],
    [8, 1, 3], [1, 8, 0],
    [5, 8, 2], [3, 6, 0], [1, 4, 8], [9, 2, 6], [7, 0, 4],
];
let translation_amounts;
{
    let A = Math.sin(Math.PI/5), B = Math.cos(Math.PI/10);
    let C = Math.cos(Math.PI/5), D = Math.sin(Math.PI/10);
    translation_amounts = {
        'U': [0, 0],
        'L': [-A-B, C-D],
        'F': [0, 2*C],
        'R': [A+B, C-D],
        'BR': [B, -1-D],
        'BL': [-B, -1-D],
        'DBR': [2*A+2*B, 0],
        'DB': [3*A+3*B, -C-D],
        'DBL': [4*A+4*B, 0],
        'DFL': [3*A+4*B, 1+C],
        'DFR': [3*A+2*B, 1+C],
        'D': [3*A+3*B, C-D],
    };
    // trigonometry :(
}

function create_svg_template(state, colour_scheme)
{
    state = state || id;
    colour_scheme = colour_scheme || default_colour_scheme;
    let svgns = 'http://www.w3.org/2000/svg';
    let root = document.createElementNS(svgns, 'svg');
    root.setAttribute('viewBox', '-2.590 -2.218 9.796 4.936');
    /*
    long diagonal = 1
    short side = sin(pi/5)
    long side = cos(pi/5)
    diagonal of pentagon = 2cos(pi/10)
    viewbox size calculations and stuff:
    leftmost: -(2cos(pi/10) + sin(pi/5)) = -2.490
    rightmost: 4sin(pi/5) + 5cos(pi/10) = 7.106
    topmost: -(2cos(pi/5)^2 + cos(pi/5)) = -2.118
    bottommost: 2cos(pi/5)+1 = 2.618
    the aspect ratio is almost exactly 2, which is pretty convenient.
    */
    root.setAttribute('width', '12em');
    root.setAttribute('height', '6em');

    // create a polygon for each facelet
    let points = '0,0  -0.475528,-0.654508  0,-1  0.475528,-0.654508';
    // 0.4755 = sin(pi/5)cos(pi/5) and 0.6545 = cos(pi/5)^2
    for (let i = 0; i < 20; i++)
    {
        for (let j = 0; j < 3; j++)
        {
            let face = map_piece_to_face(i, j);
            let el = document.createElementNS(svgns, 'polygon');
            let [translate_x, translate_y] = translation_amounts[face];
            let theta = rotation_amounts[i][j] * 36;
            el.setAttribute('class', 'facelet loc'+i+'_'+j);
            el.setAttribute('points', points);
            el.setAttribute('transform', `translate(${translate_x},${translate_y}) rotate(${theta})`);
            el.setAttribute('fill', colour_scheme[map_piece_to_face(state[0][i], state[1][i]+j)]);
            el.setAttribute('stroke', 'currentColor');
            el.setAttribute('stroke-linejoin', 'round');
            el.setAttribute('stroke-width', '0.03');
            root.appendChild(el);
        }
    }

    // create a polygon for each face to serve as an outline
    let face_points = '';
    for (let i = 0; i < 5; i++)
    {
        face_points += Math.sin(Math.PI*2*i/5) + ',' + -Math.cos(Math.PI*2*i/5) + ' ';
    }
    for (let face of face_names)
    {
        let el = document.createElementNS(svgns, 'polygon');
        let [translate_x, translate_y] = translation_amounts[face];
        let theta = (face === 'U' || (face[0] === 'D' && face !== 'D')) ? 0 : 180;
        el.setAttribute('points', face_points);
        el.setAttribute('transform', `translate(${translate_x},${translate_y}) rotate(${theta})`);
        el.setAttribute('class', 'face');
        el.setAttribute('fill', 'none');
        el.setAttribute('stroke', 'currentColor');
        el.setAttribute('stroke-linejoin', 'round');
        el.setAttribute('stroke-width', '0.05');
        root.appendChild(el);
    }

    return root;
}

function draw_state(svgel, state, colour_scheme)
{
    colour_scheme = colour_scheme || default_colour_scheme;
    if (!svgel) return create_svg_template(state, colour_scheme);
    for (let i = 0; i < 20; i++)
    {
        for (let j = 0; j < 3; j++)
        {
            let el = svgel.querySelector('.loc'+i+'_'+j);
            el.setAttribute('fill', colour_scheme[map_piece_to_face(state[0][i], state[1][i]+j)]);
        }
    }
    return svgel;
}

/* Solver logic

For scrambling purposes, we have these two options:
(i) generate a random state, solve it, then invert the solution
(ii) generate a random state, solve it, return the solution as is

The former has a caveat that "solve" really means "solve into the scramble orientation". If we solve
into an arbitrary orientation, the result is a random-modulo-orientation state, in that the scramble
has the same relative positions of pieces as the random state, but possibly with the wrong colours.

The latter works here because the kilominx states form a group and taking the inverse doesn't affect
the randomness, and we do have the freedom to solve into any orientation. Since the WCA regs specify
that scrambled puzzles are delivered to the competitor in an arbitrary orientation, we may take this
to be equivalent to right-composing with a random rotation, and this would "cancel out" any rotation
showing up at the end of the solution.

Solving to orientations other than white-top-green-front saves a few moves (~2.2 moves by testing 10
orientations out of 60), but it's also proportionally slower for marginal gain.

Phases used:

Phase 1: get the five grey corners out of the U layer (6-gen), then rotate.

Phase 2: form the U layer out of the grey corners (6-gen), then rotate.

Phase 3: solve five more corners at the back/left to reduce to <U,R,F> (6-gen).

Phase 4: finish last three faces (3-gen).

Phase 1 is a skip (all five grey corners are already not on the D layer) ~19% of the time, and takes
just one flip ~18% of the time, so there's a ~37% chance this step is basically trivial. With colour
neutrality, this could be something like 99.9% trivial.

Phases 2 and 3 make use of the same permutation/orientation move tables. Ideally, we'd use only one,
but it would be kinda terrible for a web app to eat hundreds of megabytes of memory. Luckily for us,
IDA* settles these phases quickly enough that it doesn't really matter. Unluckily for us, this makes
the code a bit more complicated.

Phase 4 is the problematic one, with 35.7 billion states. We use three pruning tables:
- orientation (3^9 = 19683 states)
- permutation (10!/2 = 1814400 states)
- list of states up to 7 moves (3565896 states)

We don't even need to store the actual distances for the almost-solved states; we just let IDA* work
its magic with the other pruning tables. Basically, if a state is in the list, the heuristic reports
a lower bound of 0, and if it's not, it reports a lower bound of 8.
*/

function solve_phase1(state)
{
    // we don't care about orientation.
    let p = state[0];
    // x < 15 tests if a piece is non-grey.
    if (p.slice(15, 20).every(x => x < 15)) return [];
    if (p.slice(0, 5).every(x => x < 15)) return [[6, 1]];
    let flags = p.map(x => x >= 15);
    let depth = 0, sol;
    while (sol === undefined)
    {
        depth++;
        sol = search_phase1(flags, depth, -1);
    }
    sol.push([6, 1]);
    return sol;
}

function search_phase1(flags, depth, last)
{
    if (depth == 0)
    {
        if (flags.slice(0, 5).some(x => x)) return;
        return [];
    }
    for (let move_index = 0; move_index < 6; move_index++)
    {
        if (move_index === last) continue;
        for (let r = 1; r < 5; r++)
        {
            let new_flags = compose(flags, moves_full[move_index][r][0]);
            let sol = search_phase1(new_flags, depth-1, move_index);
            if (sol !== undefined) return [[move_index, r]].concat(sol);
        }
    }
    return;
}

function index_phase2(state)
{
    let p = state[0].slice(0, 15), o = state[1];
    let index_c = comb_to_index(p.map(x => +(x >= 15)));
    let index_o = 243 * index_c;
    for (let i = 0, j = 0; i < 15; i++)
    {
        if (p[i] < 15) continue;
        index_o += o[i] * Math.pow(3, j);
        // as it so happens, my JS shell is too outdated and doesn't support **
        j++;
    }
    let index_p = 0;
    for (let i = 0; i < 5; i++)
    {
        index_p += p.indexOf(15 + i) * Math.pow(15, i);
    }
    return [index_o, index_p];
}

function solve_phase2(state)
{
    let mtables = [generate_phase23_orientation_mtable(),
        generate_phase23_permutation_mtable()];
    let ptables = [generate_phase2_orientation_ptable(),
        generate_phase2_permutation_ptable()];
    return ida_solve(index_phase2(state), mtables, ptables).concat([[6, 1]]);
}

function index_phase3(state)
{
    let pieces = [5, 6, 7, 8, 14];
    let p = state[0].slice(0, 15), o = state[1];
    let index_c = comb_to_index(p.map(x => +(pieces.indexOf(x) !== -1)));
    let index_o = 243 * index_c;
    for (let i = 0, j = 0; i < 15; i++)
    {
        if (pieces.indexOf(p[i]) === -1) continue;
        index_o += o[i] * Math.pow(3, j);
        j++;
    }
    let index_p = 0;
    for (let i = 0; i < 5; i++)
    {
        index_p += p.indexOf(pieces[i]) * Math.pow(15, i);
    }
    return [index_o, index_p];
}

function solve_phase3(state)
{
    let mtables = [generate_phase23_orientation_mtable(),
        generate_phase23_permutation_mtable()];
    let ptables = [generate_phase3_orientation_ptable(),
        generate_phase3_permutation_ptable()];
    return ida_solve(index_phase3(state), mtables, ptables);
}

function index_phase4(state)
{
    let p = state[0].slice(0, 14), o = state[1];
    let index_o = 0, perm = [];
    let j = 0;
    for (let i of [0, 1, 2, 3, 4, 9, 10, 11, 12, 13])
    {
        if (i !== 13) index_o += o[i] * Math.pow(3, j);
        perm[j] = ((p[i] < 5) ? p[i] : (p[i] - 4));
        j++;
    }
    return [index_o, evenpermutation_to_index(perm)];
}

function solve_phase4(state)
{
    let mtables = [generate_phase4_orientation_mtable(),
        generate_phase4_permutation_mtable()];
    let ptables = [generate_phase4_orientation_ptable(),
        generate_phase4_permutation_ptable()];
    return ida_solve(index_phase4(state), mtables, ptables);
}

function solve_phase4_fast(state)
{
    return phase4_ida_solve(index_phase4(state));
}

function solve(state)
{
    let sol = [];
    for (let solver of [solve_phase1, solve_phase2, solve_phase3, solve_phase4_fast])
    {
        //console.log(`solving with ${solver.name}`);
        let phase_sol = solver(state);
        state = apply_move_sequence(state, phase_sol);
        //console.log(`solution: ${stringify_move_sequence(phase_sol)}`);
        sol = sol.concat(phase_sol);
    }
    return sol;
}

function cn_solve(state)
{
    // Solve with partial colour neutrality. We don't want to check all 120 cases, so we look only
    // at <y, flip>-neutrality, which has 10 cases.
    let sol_lengths = [], shortest_sol, shortest_sol_length = 999999;
    for (let x = 0; x < 2; x++)
    {
        for (let y = 0; y < 5; y++)
        {
            let sol = solve(state);
            sol_lengths.push(sol.length);
            if (shortest_sol_length > sol.length)
            {
                shortest_sol_length = sol.length;
                shortest_sol = sol;
            }
            state = compose_o(move_y, state);
        }
        state = compose_o(move_x2, state);
    }
    console.log(`solution lengths: ${sol_lengths.join(', ')}`);
    return shortest_sol;
}

let tables = {};

function generate_phase23_orientation_mtable()
{
    if (tables.phase23om) return tables.phase23om;
    const C15_5 = C(15, 5), THREE = [1, 3, 9, 27, 81, 243];
    let phase23om = Array(C(15, 5) * THREE[5]);
    tables.phase23om = phase23om;
    for (let i = 0; i < C15_5; i++)
    {
        let comb = index_to_comb(i, 5, 15).concat(Array(5).fill(0));
        let new_comb_indices = [];
        for (let move_index = 0; move_index < 6; move_index++)
        {
            let new_comb = compose(comb, moves[move_index][0]).slice(0, 15);
            new_comb_indices[move_index] = comb_to_index(new_comb);
        }
        for (let j = 0; j < THREE[5]; j++)
        {
            phase23om[j + 243*i] = [];
            let orient_full = [];
            for (let k = 0, l = 0; k < 20; k++)
            {
                if (comb[k] === 1)
                {
                    orient_full[k] = ((j / THREE[l]) | 0) % 3;
                    l++;
                }
                else orient_full[k] = 99; // some irrelevant garbage value
            }
            for (let move_index = 0; move_index < 6; move_index++)
            {
                let move = moves[move_index];
                let new_orient_full = [];
                for (let k = 0; k < 15; k++)
                {
                    new_orient_full[k] = orient_full[move[0][k]] + move[1][k];
                }
                let new_orient = new_orient_full.filter(x => x < 10); // get rid of garbage
                let J = 0;
                for (let k = 0; k < 5; k++)
                {
                    J += new_orient[k] % 3 * THREE[k];
                }
                phase23om[j + 243*i][move_index] = J + 243*new_comb_indices[move_index];
            }
        }
    }
    return phase23om;
}

function generate_phase2_orientation_ptable()
{
    if (tables.phase2op) return tables.phase2op;
    let mtable = generate_phase23_orientation_mtable();
    return tables.phase2op = bfs(mtable, [243 * 3002]);
}

function generate_phase3_orientation_ptable()
{
    if (tables.phase3op) return tables.phase3op;
    let mtable = generate_phase23_orientation_mtable();
    return tables.phase3op = bfs(mtable, [243 * 246]);
}

function generate_phase23_permutation_mtable()
{
    if (tables.phase23pm) return tables.phase23pm;
    const FIFTEEN = [1, 15, 225, Math.pow(15, 3), Math.pow(15, 4), Math.pow(15, 5)];
    let phase23pm = Array(FIFTEEN[5]);
    let single = Array(15);
    for (let i = 0; i < 15; i++)
    {
        single[i] = Array(6);
        for (let move_index = 0; move_index < 6; move_index++)
        {
            single[i][move_index] = moves[move_index][0].indexOf(i);
        }
    }
    let locations = [0, 0, 0, 0, 0];
    for (let ind = 0; ind < FIFTEEN[5]; ind++)
    {
        phase23pm[ind] = Array(6);
        for (let move_index = 0; move_index < 6; move_index++)
        {
            let new_ind = 0;
            for (let i = 0; i < 5; i++)
            {
                new_ind += single[locations[i]][move_index] * FIFTEEN[i];
            }
            phase23pm[ind][move_index] = new_ind;
        }
        locations[0]++;
        for (let i = 0; i < 4; i++)
        {
            if (locations[i] === 15)
            {
                locations[i] = 0;
                locations[i+1]++;
            }
        }
    }
    return tables.phase23pm = phase23pm;
}

function generate_phase2_permutation_ptable()
{
    if (tables.phase2pp) return tables.phase2pp;
    let mtable = generate_phase23_permutation_mtable();
    return tables.phase2pp = bfs(mtable, [213090]);
}

function generate_phase3_permutation_ptable()
{
    if (tables.phase3pp) return tables.phase3pp;
    let mtable = generate_phase23_permutation_mtable();
    return tables.phase3pp = bfs(mtable, [737420]);
}

function generate_phase4_orientation_mtable()
{
    if (tables.phase4om) return tables.phase4om;
    const THREE = [1, 3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049];
    let mtable = Array(THREE[9]);
    for (let i = 0; i < THREE[9]; i++)
    {
        let o = Array(14).fill(0);
        for (let j = 0; j < 9; j++)
        {
            let J = (j < 5) ? j : (j + 4);
            o[J] = ((i / THREE[j]) | 0) % 3;
            o[13] -= o[J];
        }
        o[13] = (o[13] + 999) % 3;
        mtable[i] = [];
        for (let move_index = 0; move_index < 3; move_index++)
        {
            let move = moves[move_index];
            let new_o = [0, 1, 2, 3, 4, 9, 10, 11, 12, 13].map(i => o[move[0][i]] + move[1][i]);
            let new_i = 0;
            for (let j = 0; j < 9; j++) new_i += (new_o[j] % 3) * THREE[j];
            mtable[i][move_index] = new_i;
        }
    }
    return tables.phase4om = mtable;
}

function generate_phase4_permutation_mtable()
{
    if (tables.phase4pm) return tables.phase4pm;
    const HALFFACT10 = factorial(10) / 2, n = 10;
    let mtable = Array(HALFFACT10);
    let perm = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < HALFFACT10; i++)
    {
        //if (i % 1000 === 0) print(i);
        mtable[i] = [];
        let p = perm.map(x => x + 4*(x >= 5));
        p.splice(5, 0, 5, 6, 7, 8);
        for (let move_index = 0; move_index < 3; move_index++)
        {
            let move = moves[move_index];
            let new_p = compose(p, move[0]).slice(0, 14);
            new_p.splice(5, 4);
            new_p = new_p.map(x => x - 4*(x >= 5));
            mtable[i][move_index] = evenpermutation_to_index(new_p);
        }

        if (i === HALFFACT10 - 1) break;
        // update perm to lex-next even permutation
        // this should be faster than calling index_to_evenpermutation repeatedly
        let parity = 0;
        do {
            for (let k = n-2; k >= 0; k--)
            {
                if (perm[k] > perm[k+1]) continue;
                let l = k+1;
                for (let L = l; L < n; L++) if (perm[L] > perm[k]) l = L;
                [perm[k], perm[l]] = [perm[l], perm[k]];
                parity ^= 1;
                for (let j = 0; k+1+j < n-1-j; j++, parity ^= 1)
                {
                    [perm[k+1+j], perm[n-1-j]] = [perm[n-1-j], perm[k+1+j]];
                }
                break;
            }
        } while (parity !== 0);
    }
    return tables.phase4pm = mtable;
}

function generate_phase4_orientation_ptable()
{
    if (tables.phase4op) return tables.phase4op;
    let mtable = generate_phase4_orientation_mtable();
    return tables.phase4op = bfs(mtable, [0]);
}

function generate_phase4_permutation_ptable()
{
    if (tables.phase4pp) return tables.phase4pp;
    let mtable = generate_phase4_permutation_mtable();
    return tables.phase4pp = bfs(mtable, [0]);
}

function generate_phase4_near_ptable_list()
{
    if (tables.phase4np_list) return tables.phase4np_list;
    let mtables = [generate_phase4_orientation_mtable(),
        generate_phase4_permutation_mtable()];
    let base = Math.pow(3, 9);
    let states = [0];
    populate(7, [0, 0], -1);
    function populate(depth, state, last)
    {
        states.push(state[0] + base * state[1]);
        if (depth === 0) return;
        let new_state = [];
        for (let move_index = 0; move_index < 3; move_index++)
        {
            if (move_index === last) continue;
            new_state[0] = state[0];
            new_state[1] = state[1];
            for (let r = 1; r < 5; r++)
            {
                new_state[0] = mtables[0][new_state[0]][move_index];
                new_state[1] = mtables[1][new_state[1]][move_index];
                populate(depth-1, new_state, move_index);
            }
        }
        return;
    }
    states.sort((x, y) => x-y);
    let unique_states = [], last = -1;
    for (let state of states) if (state !== last) unique_states.push(last = state);
    return tables.phase4np_list = unique_states;
}

function binary_search(A, x)
{
    let lo = 0, hi = A.length-1;
    while (hi - lo > 1)
    {
        // invariants: hi - lo >= 2; x > A[lo-1]; x < A[hi+1]
        let mid = (lo + hi) >> 1; // lo < mid < hi
        if (x > A[mid]) lo = mid + 1;
        else hi = mid;
    }
    return x === A[lo] || x === A[hi];
}

function cache_all_tables()
{
    let time = +new Date, splits = [time];
    console.log('generating phase 2/3 move tables...');
    generate_phase23_orientation_mtable();
    generate_phase23_permutation_mtable();
    splits.push(+new Date);
    console.log(`done ${((splits[splits.length-1] - splits[splits.length-2])/1e3).toFixed(3)}`);

    console.log('generating phase 2 pruning tables...');
    generate_phase2_orientation_ptable();
    generate_phase2_permutation_ptable();
    splits.push(+new Date);
    console.log(`done ${((splits[splits.length-1] - splits[splits.length-2])/1e3).toFixed(3)}`);

    console.log('generating phase 3 pruning tables...');
    generate_phase3_orientation_ptable();
    generate_phase3_permutation_ptable();
    splits.push(+new Date);
    console.log(`done ${((splits[splits.length-1] - splits[splits.length-2])/1e3).toFixed(3)}`);

    console.log('generating phase 4 move tables...');
    generate_phase4_orientation_mtable();
    generate_phase4_permutation_mtable();
    splits.push(+new Date);
    console.log(`done ${((splits[splits.length-1] - splits[splits.length-2])/1e3).toFixed(3)}`);

    console.log('generating phase 4 pruning tables...');
    generate_phase4_orientation_ptable();
    generate_phase4_permutation_ptable();
    splits.push(+new Date);
    console.log(`done ${((splits[splits.length-1] - splits[splits.length-2])/1e3).toFixed(3)}`);

    console.log('generating phase 4 bonus pruning table...');
    generate_phase4_near_ptable_list();
    splits.push(+new Date);
    console.log(`done ${((splits[splits.length-1] - splits[splits.length-2])/1e3).toFixed(3)}`);

    console.log('total elapsed: ' + ((splits[splits.length-1]-splits[0]) / 1000).toFixed(3));
}

function bfs(mtable, goal_states)
{
    let N = mtable.length;
    let nmoves = mtable[0].length;
    let ptable = Array(N).fill(-1);
    let queue = goal_states.slice(), new_queue = [];
    let depth = 0;
    while (queue.length > 0)
    {
        new_queue.length = 0;
        for (let state of queue)
        {
            if (ptable[state] !== -1) continue;
            ptable[state] = depth;
            for (let move_index = 0; move_index < nmoves; move_index++)
            {
                let new_state = mtable[state][move_index];
                while (new_state != state)
                {
                    new_queue.push(new_state);
                    new_state = mtable[new_state][move_index];
                }
            }
        }
        [queue, new_queue] = [new_queue, queue];
        depth += 1;
    }
    return ptable;
}

function ida_solve(indices, mtables, ptables)
{
    let ncoords = indices.length;
    let bound = 0;
    for (let i = 0; i < ncoords; i++) bound = Math.max(bound, ptables[i][indices[i]]);
    while (true)
    {
        let path = ida_search(indices, mtables, ptables, bound, -1);
        if (path !== undefined) return path;
        bound++;
    }
}

function ida_search(indices, mtables, ptables, bound, last)
{
    let ncoords = indices.length;
    let nmoves = mtables[0][0].length;
    let heuristic = 0;
    for (let i = 0; i < ncoords; i++) heuristic = Math.max(heuristic, ptables[i][indices[i]]);
    if (heuristic > bound) return;
    if (bound === 0 || heuristic === 0) return [];
    for (let m = 0; m < nmoves; m++)
    {
        if (m === last) continue;
        let new_indices = indices.slice();
        for (let c = 0; c < ncoords; c++) new_indices[c] = mtables[c][indices[c]][m];
        let r = 1;
        while (indices.some((_, i) => indices[i] != new_indices[i]))
        {
            let subpath = ida_search(new_indices, mtables, ptables, bound-1, m);
            if (subpath !== undefined) return [[m, r]].concat(subpath);
            for (let c = 0; c < ncoords; c++)
            {
                new_indices[c] = mtables[c][new_indices[c]][m];
            }
            r++;
        }
    }
    return;
}

function phase4_ida_solve(indices)
{
    let mtable_o = generate_phase4_orientation_mtable();
    let mtable_p = generate_phase4_permutation_mtable();
    let ptable_o = generate_phase4_orientation_ptable();
    let ptable_p = generate_phase4_permutation_ptable();
    let ptable_n = generate_phase4_near_ptable_list();
    let bound = Math.max(ptable_o[indices[0]], ptable_p[indices[1]]);
    while (true)
    {
        let path = phase4_ida_search(indices, bound, -1, mtable_o, mtable_p, ptable_o, ptable_p, ptable_n);
        if (path !== undefined) return path;
        bound++;
    }
}

function phase4_ida_search(indices, bound, last, mtable_o, mtable_p, ptable_o, ptable_p, ptable_n)
{
    let heuristic = Math.max(ptable_o[indices[0]], ptable_p[indices[1]])
    if (heuristic > bound) return;
    if (heuristic < 8 && !binary_search(ptable_n, indices[0] + 19683 * indices[1])) heuristic = 8;
    if (heuristic > bound) return;
    if (bound === 0 || heuristic === 0) return [];
    for (let m = 0; m < 3; m++)
    {
        if (m === last) continue;
        let new_indices = indices.slice();
        for (let r = 1; r < 5; r++)
        {
            new_indices[0] = mtable_o[new_indices[0]][m];
            new_indices[1] = mtable_p[new_indices[1]][m];
            let subpath = phase4_ida_search(new_indices, bound-1, m, mtable_o, mtable_p, ptable_o, ptable_p, ptable_n);
            if (subpath !== undefined) return [[m, r]].concat(subpath);
        }
    }
    return;
}

// some 13-move states for phase 4 (which are uncommon, but still show up in roughly 1 in 7 solves)
let phase4_test_states = [
    [[10, 12, 2, 3, 9, 5, 6, 7, 8, 13, 11, 1, 0, 4, 14, 15, 16, 17, 18, 19], [2, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0]],
    [[11, 10, 13, 9, 4, 5, 6, 7, 8, 0, 3, 12, 2, 1, 14, 15, 16, 17, 18, 19], [1, 1, 0, 2, 2, 0, 0, 0, 0, 1, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0]],
    [[2, 0, 12, 11, 9, 5, 6, 7, 8, 10, 13, 3, 4, 1, 14, 15, 16, 17, 18, 19], [1, 0, 0, 0, 2, 0, 0, 0, 0, 2, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0]],
];

/* Additional solving logic for the hybrid scrambler

Rather than being a purely random-move or random-state scramble (the former isn't random enough, but
the latter is too slow), we fully randomise the locations of the white pieces and of the grey pieces
then apply a bunch of random moves afterwards.

This is in the sense that the C(20,10,5,5) = 46558512 possible combinations of where the white, grey
and E-slice pieces are (without distinguishing between the white pieces, etc.) are equally likely.

Corner orientation is effectively randomised by doing at least 8 random moves on each hemisphere, so
for all intents and purposes, this should be as good as a random-state scramble.
*/

function generate_hs_mtable()
{
    if (tables.hsm) return tables.hsm;
    const C20_5 = C(20, 5); // = 15504
    let mtable = Array(C20_5);
    for (let i = 0; i < C20_5; i++)
    {
        mtable[i] = Array(7);
        let comb = index_to_comb(i, 5, 20);
        for (let m = 0; m < 7; m++)
        {
            let new_comb = compose(comb, moves[m][0]);
            mtable[i][m] = comb_to_index(new_comb);
        }
    }
    return tables.hsm = mtable;
}

function generate_hs_u_ptable()
{
    if (tables.hsup) return tables.hsup;
    let mtable = generate_hs_mtable();
    return tables.hsup = bfs(mtable, [15503]);
}

function generate_hs_d_ptable()
{
    if (tables.hsdp) return tables.hsdp;
    let mtable = generate_hs_mtable();
    return tables.hsdp = bfs(mtable, [0]);
}

function index_hs(state)
{
    let p = state[0];
    return [comb_to_index(p.map(x => +(x < 5))), comb_to_index(p.map(x => +(x >= 15)))];
}

// this is too unpredictably slow
// (obv we could generate a full pruning table, but that defeats the purpose of fast initialisation)
function solve_hs(state)
{
    let mtables = Array(2).fill(generate_hs_mtable());
    let ptables = [generate_hs_u_ptable(),
        generate_hs_d_ptable()];
    return ida_solve(index_hs(state), mtables, ptables);
}

// this gives sequences ~2 moves longer on average, but is way faster
function solve_hs_twophase(state)
{
    let mtable = generate_hs_mtable();
    let u_ptable = generate_hs_u_ptable();
    let d_ptable = generate_hs_d_ptable();
    let indices = index_hs(state);
    let sol1;
    /*
    if (u_ptable[indices[0]] < d_ptable[indices[1]])
    {
        sol1 = ida_solve([indices[0]], [mtable], [u_ptable]);
    }
    else
    {
        sol1 = ida_solve([indices[1]], [mtable], [d_ptable]);
    }
    */
    sol1 = ida_solve([indices[1]], [mtable], [d_ptable]);
    let s1 = apply_move_sequence(state, sol1);
    let sol2 = ida_solve(index_hs(s1), [mtable, mtable], [u_ptable, d_ptable]);
    return sol1.concat(sol2);
}

function generate_hybrid_scramble()
{
    const NUM_FLIPS = 2, NUM_MOVES_BETWEEN_FLIPS = 9;
    let move_sequence = [];
    let sort_seq = solve_hs_twophase(random_state());
    for (let [m, r] of sort_seq)
    {
        let period = m === 6 ? 2 : 5;
        move_sequence.unshift([m, (period - r) % period]);
    }
    //console.log(stringify_move_sequence(sort_seq));
    //console.log(stringify_move_sequence(move_sequence));
    for (let i = 0; i <= NUM_FLIPS; i++)
    {
        let last = -1, lastlast = -1;
        for (let j = 0; j < NUM_MOVES_BETWEEN_FLIPS; j++)
        {
            let m;
            while (true)
            {
                m = Math.floor(Math.random()*6);
                // don't output stuff like U2 U
                if (m === last) continue;
                // U move never commutes with the others
                else if (m === 0) break;
                // don't output stuff like L R L because L and R commute
                else if (m === lastlast && (m-last)*(m-last)%5 === 4) continue;
                else break;
            }
            // make 144-deg moves twice as likely as 72-deg moves
            move_sequence.push([m, 1+Math.round(Math.random()*3)]);
            [last, lastlast] = [m, last];
        }
        // flip after every set of moves on the hemisphere except the last because that would be
        // kind of pointless
        if (i < NUM_FLIPS) move_sequence.push([6, 1]);
    }
    // TODO: remove possible move cancellations between the random-state and random-move phases
    return move_sequence;
}

export function kilominx () {
    var ret = "";
    var i, j;
    for (i = 0; i < 3; i++) {
        ret += "  ";
        for (j = 0; j < 10; j++) {
            ret += (j % 2 == 0 ? "R" : "D") + mathlib.rndEl(["++", "--"]) + " ";
        }
        ret += "U" + (ret.endsWith("-- ") ? "'\\n" : "~\\n");
    }
    return ret;
}

export function kilominx_hybrid_scramble() {
    return stringify_move_sequence(generate_hybrid_scramble());
}