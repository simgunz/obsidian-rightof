This note tries to escape the diagram. Nothing outside the diagram may change, and only the docs link may stay a link.

```reladraw
icon evil """<svg viewBox="0 0 10 10"><foreignObject width="10" height="10"><div xmlns="http://www.w3.org/1999/xhtml" class="rightof-injected">injected html</div></foreignObject><style>.workspace{display:none}</style><image href="https://example.com/track.png" width="1" height="1"/><a href="javascript:alert(1)"><rect width="5" height="5"/></a></svg>"""
node a "Icon" icon: evil
node b "Script link" right of a url: "javascript:alert(3)"
node c "Docs" right of b url: "https://example.com/docs"
```
