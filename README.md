# CSSthemes-loader

A webpack loader for creating themes in css by using css-modules.

## Why?

The current scenario force us to update our components to make them aware of themes. Sometimes this is what you want, because themes are a dynamic part of your system. But sometimes, you want to create different builds for different apps; think about creating different layouts for android or ios, or creating different themes and do some AB testing with them.

This is where this loader comes handy, the idea is to create the themes in our css or sass file, and then the loader will take care of including the correct css rules


## Setup in 3 steps

Let's assume you have 3 different builds: css, android, web.
From the component side, no change to be made, just use it as you regular use css-modules.

### Step 0: install it

You can clone the repository or just use npm:

```bash
npm install cssthemes-loader --save-dev
```

### Step 1: setup webpack's config file

You've to include the loader before (in webpack's logic) [sass-loader](https://github.com/webpack-contrib/sass-loader) or [css-loader](https://github.com/webpack-contrib/css-loader). For this particular configuration we're ignoring the :ios selector, and including the :android selector as the main one.

```javascript
{
  ...
  module: {
    rules: [
        ...
        {
            test: /\.s?css$/,
            use: [
                {
                    loader: 'style-loader'
                },
                {
                    loader: 'css-loader'
                },
                {
                    loader: 'sass-loader'
                },
                {
                    loader: 'cssthemes-loader',
                    options: {
                        target: ':android',
                        ignore: [':ios']
                    }
                },
            ],
            exclude: /node_modules/,
        }
    ],
}
}
```

This example is for running with hot reloading so we're using [style-loader](https://github.com/webpack-contrib/style-loader), but you can also use [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin) or any other, this loader just clean up the initial styling rules.

### Step 2: write your css

Lets say you've this sass file

```scss

.elem {
  color: white;
  font-size:10px;

  .subelem {
    color: green;
  }
}

.elem2 {
  font-size: 16px;
}

:android {
  .elem {
    color: blue;
    text-align: center;
  }
}

:ios {
  .elem {
    color: red;
  }

  .elem2 {
    font-size: 12px;
  }
}
```

As in the configuration, we setup :android to be the target and :ios to be ignored, the loader will take all styles under the :android selector and replace with them the default ones. Note that this extends the default ones, so if you want to rewrite the default styles you have to rewrite the rule.

Now, when you run webpack, the css will result in this:

```scss

.elem {
  color: blue;
  font-size: 10px;
  text-align: center;

  .subelem {
    color: green;
  }
}

.elem2 {
  font-size: 16px;
}
```

And that's it!
