# Title

<General Info>

## Goals/TODO

### General

- [x] link old editor https://neuralcoder3.github.io/
- [x] redirect from https://neuralcoder3.github.io/

### Automata Editor

The editor should be intuitive and easy to use.
- [x] Add a new node
- [x] named nodes
- [x] have a unique start node
- [x] multiple edges between nodes (or separated labels)
- [x] named labels
- [x] custom nodes
- [x] mark nodes as final (double border)
  - [ ] good looking double outline
- [x] select nodes, edges
- [x] move nodes
- [x] add edges
- [x] delete nodes, edges
- [x] save/load automata
- [x] extract simple datastructure
- [x] zoom
- [x] pan

### Export Formats

- [ ] Graphviz
- [x] LaTeX (Tikz)
- [x] JSON
- [x] Text (5-Tuple)
- [x] Url
- [x] Image
- [x] SVG
- [ ] Table (for Turing)
- [x] RegEx
- [x] Grammar

### Memory

- [x] Save to perma link
- [x] Save to local storage
- [x] Save to file
- [x] Save to server
- [x] Import from all

### Simulation

- [x] Step through automata (highlight current node and position in word)
- [x] Word input
- [x] list of words (marked intended rejections) => bulk judge
- [x] NFA simulation
- [ ] Turing simulation
- [ ] PDA simulation

### Special Features

- [x] Regex to automata
- [x] Automata to regex
- [x] Minize automata
- [x] NFA to DFA (power automaton)
- [x] Check equivalence (as import)
- [ ] compute equivalence classes (myhill-nerode) (as export)
- [x] Regex labels

### Bugs/Tests

- [ ] Check for power automaton (epsilons)
- [ ] Check for regex labels

### Preview

![Concept](concept.png)


## Technical

To install the packages, you might need to use `npm i --legacy-peer-deps`.

The theory is abstracted in `src/GraphUtils.tsx` and `src/interfaces.tsx`.

