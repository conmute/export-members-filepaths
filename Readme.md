# Export members filepaths

## Why?

**Premise**:

> Webpack and rollup tree shaking is unreliable and
> `sideEffects=false` configuration was not working

**Intent**:

In order to avoid including the whole package, I would like to have smart import by path
Without writing full path to each import member

**Example**:

This will include the whole package, tree shaking usually not works properly:

```
import { memberName } from 'package_name'; 
```

To resolve this i need to write:

```
import { memberName } from 'package_name/path/to/memberName'; 
```

But if smth will change in a library, I need to write all the paths as well...
So I need to have this done automatically

This is possible with help of `babel-plugin-transform-import` and this parser that will fetch all
the libs exported member pathnames

## How?

Get all named exports into map of expot member names to filepath

For example:

`path/to/index.js`

```
export { memberName }
```

will give this data:

```
{
    'memberName': [
        'path/to/index.js'
    ],
}
```

Array because this member can be found in many places. 
The proirity will be to that one that is closer to the top of the structure tree
