The middle node links to example.com.

```reladraw
node left   "Left"
node linked "Linked node" right of left  url: "https://example.com"
node right  "Right" right of linked
edge left -> linked
edge linked -> right
```
