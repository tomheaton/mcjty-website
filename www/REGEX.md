# regex

## image

```regexp
```\n<img src="https?://(.*?)" alt="(.*?)">\n```

\n![$2](https://$1)\n
```

## code block

```regexp
```\n<syntaxhighlight lang="(.*?)">\n((.|\n)*?)\n</syntaxhighlight>\n```

```$1\n$2\n```
```
