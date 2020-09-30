# Clean old files
rm -rf lib
rm -rf test

# Run the script
deno run --unstable --allow-write --allow-read to_deno.js 

# Autoformat the code
deno fmt lib
deno fmt test

# Run the tests
deno test --unstable --allow-read test/*
