# postcss for deno (Work in progress)

Scripts to transform the source code of postcss for Deno compatibility.

```sh
# Clone postcss
git clone git@github.com:postcss/postcss.git

# Run the script
deno run --unstable --allow-write --allow-read to_deno.js 

# Autoformat the code
deno fmt lib
deno fmt test

# Run the tests
deno test --unstable --allow-read test/*
```