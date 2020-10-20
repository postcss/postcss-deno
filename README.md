# Postcss for Deno

Scripts to transform the source code of postcss for Deno compatibility.

```sh
sh run.sh
```

To import Postcss in your Deno project:

```js
import postcss from "https://deno.land/x/postcss/mod.js";
import autoprefixer from "https://dev.jspm.io/autoprefixer";

const result = await postcss([autoprefixer]).process(css);
```
