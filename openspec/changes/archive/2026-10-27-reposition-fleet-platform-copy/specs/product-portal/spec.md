# product-portal

## ADDED Requirements

### Requirement: Homepage hero carries fleet-platform positioning

首页（`/`、`/zh`）hero SHALL 双语呈现「AI-native agent 集群平台」定位句，语义覆盖「组建、管理、迭代、分享自己的 agent 集群」；既有五线阶梯叙事与线卡网格 SHALL 保留在 hero 同屏或紧邻区块。首页线卡区副题与 `/products[|/zh]` 目录副题 SHALL 陈述「五线=集群的供给域」。

#### Scenario: 中文首页定位句

- **WHEN** 访客打开 `/zh`
- **THEN** hero 标题与副题表述 agent 集群平台（组建/管理/迭代/分享），线卡副题表明五线供给集群

#### Scenario: 英文首页定位句

- **WHEN** 访客打开 `/`
- **THEN** hero 以英文表述同一定位，不出现未翻译的裸中文段落；阶梯叙事仍可见

### Requirement: 线卡与线页供给域框架

五条线的展示一句话（首页线卡与产品目录 tab 共用）SHALL 遵守框架：壹座一句话呈现集群平台与「组建/管理/迭代/分享」语意；其余四线一句话以供给域身份描述（文案带供给域字样或等义表述），任何一线 SHALL NOT 自称「集群」本体。

#### Scenario: 壹座卡呈现集群动词语义

- **WHEN** 访客看首页或 `/products` 的壹座线卡
- **THEN** 一句话呈现组建/管理/迭代/分享的妙意

#### Scenario: 供给域线不自称集群

- **WHEN** 访客看其余四线任一线卡或线页
- **THEN** 一句话以供给域口吻出现，无「本线的集群/fleet」表述

### Requirement: 壹座落地页四动词与萬星分工

`/products/base[|/zh]` 落地页 hero SHALL 呈现集群平台旗舰形态：四动词（组建/管理/迭代/分享）齐全的一句定位，并出现「萬星把集群放到线上运行（部署驻留、多台机器）」的分工表述。既有双轨（云端/本地）与下载带等板块 SHALL 保留。

#### Scenario: 中文壹座页

- **WHEN** 访客打开 `/zh/products/base`
- **THEN** hero 一句含四动词语意，并出现萬星上线运行分工句；云端/本地双轨板块在场

#### Scenario: 英文壹座页

- **WHEN** 访客打开 `/products/base`
- **THEN** hero 与分工句、双轨板块以英文等价呈现

### Requirement: 诚实口径

本 change 新增或改写的文案 SHALL NOT 出现「接管/替代/取代所有（人类）工作」「全面接管」「replac* all （human ）work」「tak* over all (human )work」类绝对化替代表述；人机分工以「职责变了/主人位」类口径表述。

#### Scenario: 绝对化表述零命中

- **WHEN** 审阅本 change 的全部新增文案
- **THEN** 上述模式无一命中
