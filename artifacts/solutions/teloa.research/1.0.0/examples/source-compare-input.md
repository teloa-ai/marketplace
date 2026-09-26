<!-- 合成样例，非真实数据；产品「Fileport」与所有来源均为虚构 -->

# 多源对比任务输入（合成样例）

**对比问题：** 虚构开源文件网关 Fileport v2 的单文件上传大小限制到底是多少、能否调整？
**读者：** 平台团队，用于决定是否需要为大文件另开通道
**对比维度：** 默认值、可配置上限、适用版本、限制与例外（负责人指定）
**任务日期：** 2026-09-25

---

## 来源 S1：Fileport 官方文档「Upload limits」页快照

- 访问地址：https://docs.fileport.example/v2/limits（虚构）
- 检索日期：2026-09-25
- 页面标注版本：v2.3，最后更新 2026-08-02

> The default maximum size for a single upload is 50 MB. Set `upload.max_file_size` to raise it; values above 500 MB are rejected at startup. Chunked uploads are not subject to this limit.

## 来源 S2：社区博客「Fileport 部署踩坑记」

- 访问地址：https://blog.example/fileport-notes（虚构）
- 检索日期：2026-09-25
- 发布日期：2025-12-14；文中未写明 Fileport 版本

> 默认只能传 20 MB，改配置也最多到 100 MB，超过就报 413。大文件建议走对象存储直传。

## 来源 S3：内部 Wiki「Fileport 接入说明」（虚构公司「北岸软件」）

- 位置：内部 Wiki 页面「平台 / Fileport 接入说明」，最后编辑 2026-05-20
- 检索日期：2026-09-25
- 页面注明「基于 Fileport v2.1」

> 我们线上配置 `upload.max_file_size = 100MB`，默认值是 50 MB。分块上传接口暂未开放给业务方。
