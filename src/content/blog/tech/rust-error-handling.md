---
title: "Rust 错误处理最佳实践"
date: 2025-08-12
---

总结 Rust 中常见的错误处理模式和 crate 选择。

## thiserror vs anyhow

- **thiserror**：适合库代码，定义自定义错误类型
- **anyhow**：适合应用代码，简化错误传播

## 自定义错误类型

```rust
#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Config error: {0}")]
    Config(String),
}
```

## Result 别名

为常用 Result 类型定义类型别名，减少模板代码。
