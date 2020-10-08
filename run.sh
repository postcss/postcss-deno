# Clean old files
rm -rf lib
rm -rf test
rm -rf postcss

# Clone the repo
git clone --depth 1 --branch master https://github.com/postcss/postcss.git

# Run the script
deno run --unstable --allow-write --allow-read to_deno.js 

# Autoformat the code
deno fmt lib
deno fmt test

# Run the tests
deno test --unstable --allow-read test/*
