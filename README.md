# PostCSS for Deno

Scripts to transform the source code of PostCSS for Deno compatibility.

```sh
sh run.sh
```

To import Postcss in your Deno project:

```js
import postcss from "https://deno.land/x/postcss/mod.js";
import autoprefixer from "https://deno.land/x/postcss_autoprefixer/mod.js";

const result = await postcss([autoprefixer]).process(css);
```
