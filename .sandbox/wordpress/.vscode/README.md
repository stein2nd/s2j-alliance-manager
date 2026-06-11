# VS Code / Cursor ワークスペース設定

## textlint

Markdown の lint / 保存時 auto-fix には [textlint 拡張](https://marketplace.visualstudio.com/items?itemName=3w36zj6.textlint) (`3w36zj6.textlint`) が必要です。

1. **Extensions: Show Recommended Extensions** から **textlint** をインストールする
2. 必要なら textlint.settings.jsonc.example の内容を settings.json にマージする

拡張をインストールしていない状態で `textlint.*` を `settings.json` に書くと、「不明な構成設定」と表示されます (拡張が設定スキーマを提供するため)。

`.textlintrc.json` は workspace root に置いてあり、拡張は通常これを自動検出します。`textlint.nodePath` 等はワークスペースの `node_modules` を使う場合のみ example を参照してください。
