---
layout: post
title:  "JWT 介绍 - Step by Step"
date:   2021-03-25 00:10:09 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Mohamad Lawand 2021年3月11日的文章 [《Intro to JWT - Step by Step》](https://dev.to/moe23/intro-to-jwt-mcb) [^1]

[^1]: <https://dev.to/moe23/intro-to-jwt-mcb> Intro to JWT - Step by Step

<!-- In this article I will be giving you an introduction about JWT. -->

在本文中，我将向您介绍 [JWT](https://jwt.io/)[^2]。
[^2]: <https://jwt.io/> jwt.io

我们今天要讲的内容包含：

- JWT 是什么
- 我们应该什么时候使用它
- JWT 对比 Session Id
- JWT 结构
- JWT 签名

## JWT 是什么

<!-- JWT (Json Web Token) is an open standard that defines a compact and self-contained way for securely transmitting information between parties as a JSON object.

So in simpler terms its an encrypted string in json format that contain sensitive information which allow us to verify the sender between different services -->

JWT (Json Web Token) 是一个开放标准[^rfc7519]，它定义了一种以紧凑和自包含的方式，用于在各方之间安全地传输编码为 JSON 对象的信息。

[^rfc7519]: <https://tools.ietf.org/html/rfc7519> RFC 7519

因此，简单来说，它是 JSON 格式的加密字符串，其中包含敏感信息，使我们能够验证不同服务之间的发送者。

## 什么时候应该使用 JWT？

<!-- - Authorisation: This is the most common scenario for using JWT. JWT is used for authorisation not authentication. With authentication we are verifying that the username and password are valid, we are logging the user into the system. With authorisation we are validating that the requests that's being sent to the server belong to the user who has logged in during the authentication, we are authorising that this user has access to the system basically allowing the user to access routes, services, and resources that are permitted with that token. -->

<!-- Information Exchange: JSON Web Tokens are a good way of securely transmitting information between parties. Because JWTs can be signed—for example, using public/private key pairs—you can be sure the senders are who they say they are. Additionally, as the signature is calculated using the header and the payload, you can also verify that the content hasn't been tampered with. -->

- **授权：** 这是使用 JWT 最常见的场景。JWT 用于授权而非身份验证。通过身份验证，我们验证用户名和密码是否有效，并将用户登录到系统中。通过授权，我们可以验证发送到服务器的请求是否属于通过身份验证登录的用户，从而可以授权该用户具有访问系统的权限，继而批准该用户使用获得的 token 访问路由、服务和资源。
- **信息交换：** Json Web Token 是在各方之间安全地传输信息的一种好方法。因为 JWT 可以被签名（例如，使用公钥/私钥对），所以您可以确定发送者是他们所声称的那一方。此外，由于签名是使用 header 和 payload 计算的，因此您还可以验证发送的内容没有被篡改。

## Session Id 对比 JWT

### 小型 Web 应用程序

#### Session Id 实现

<!-- In traditional web applications we use sessions to authorise the users, once the users logged-in into the application we assign a unique session id for user. We save this session id in a secure cookie in the user browser and in the server memory. We keep using the same session with every request so the server knows the user is authenticate. With every request the session id in the cookie is matched with the session id in the server memory to verify that the user is authorised -->

在传统的 Web 应用程序中，我们使用 Session 来授权用户，当用户登录到应用程序后，我们会为用户分配一个唯一的 Session Id。我们将此 Session Id 保存在用户浏览器的安全 cookie 中和服务器的内存中。我们对每个请求都使用相同的会话，以便服务器知道该用户已通过身份验证。对于每个请求，cookie 中的 Session Id 都会与服务器内存中的 Session Id 匹配，以验证用户是否被授权。

![Session Id Implementation](/assets/images/202103/session-id-implementation.png)

#### JWT 实现

<!-- In JWT implementation we use JWT to authorise the users, once the users logged-in into the application will generate a unique JWT for every authenticated user. We save the token in local storage or cookie in the browser, but we don't save anything on the server side .With every request the token is sent to the server to be decrypted and validated to verify that the user is authorised, if the token is manipulated in anyway its rejected -->

在 JWT 实现中，我们使用 JWT 授权用户，当用户登录到应用程序后，就会为每个通过身份验证的用户生成唯一的 JWT。我们将该 token 保存在浏览器的 local storage 或者 cookie 中，但不会在服务器端保存任何内容。对于每个请求，该 token 都会发送到服务器进行解密和验证，以核实该用户是否被授权，不管以任何方式篡改了 token 都会被拒绝。

![Implementation with JWT](/assets/images/202103/implementation-with-jwt.png)

These implementations are fine for small sites, but we can already see some benefits in JWT by reducing the load from server since we are not storing the session id anymore.

这种实现对于小型站点来说很好，但是由于我们不再存储 Session Id，因此通过减少服务器的负载，我们已经在 JWT 中看到了一些好处。

### 高级 Web 应用程序（多个服务器）

<!-- What happens if our application grew in popularity and we need to scale our application. -->

如果我们的应用程序越来越受欢迎，我们需要扩展我们的应用程序，会发生什么呢？

#### Session Id 实现

![Session Id Implementation Multiple Servers](/assets/images/202103/session-id-implementation-multiple.png)

<!-- We need to have a new server connected to a load balancer to navigate traffic between web servers based traffic and availability. This implementation introduce a new a new problem for us, which is the following -->

我们需要有一台连接到负载均衡器的新服务器，以便基于流量和可用性在 Web 服务器之间导航流量。这个实现为我们带来了一个新的问题，如下：

<!-- What happens if user 1 has logged in with server 1 and server 1 has saved the session in its memory, when user 1 makes another request and the load balancer redirects the request to server 2 and server 2 doesn't have that session information saved. -->

如果用户 1 登录到了服务器 1，那么服务器 1 已经将 session 保存在其内存中，当用户 1 发出另一个请求并且负载均衡器将请求重定向到了服务器 2，而服务器 2 没有保存该 session 信息时，会发生什么情况？

<!-- The user would be logged out of the application and be asked to sign in again, which is not a good user experience. The way we fix this but introducing cache -->

用户将被认为已退出应用程序并被要求再次登录，这不是一个好的用户体验。我们解决这个问题的方法是引入缓存。

![Session Id Implementation introducing cache](/assets/images/202103/session-id-implementation-cache.png)

<!-- All sessions now will be saved as well in the cache, so either servers can check if this session exist and can utilise it to verify the user and grant them access to the application. -->

现在，所有的 Session 也将同时保存在缓存中，因此任何一台服务器都可以检查该 Session 是否存在，并可以利用它来验证用户并授予他们对应用程序的访问权限。

<!-- Although cache fixes our problem but this solution become very costly in a production environment -->

尽管缓存解决了我们的问题，但是在生产环境中，这种解决方案的成本非常高。

<!-- a lot of RAM, CPU, Storage to keep track of all of those sessions as well as processing the requests smoothly.
Maintaining the cache to make sure there is no ghost sessions or invalid ones
In case a server crash all sessions are lost which are not synced with cache
Invaliding users is more complicated
Hosting cost is high -->

- 需要大量的 RAM、CPU、存储来跟踪所有这些会话和平稳地处理请求
- 需要维护缓存，以确保没有幽灵会话或无效会话
- 万一某台服务器崩溃，所有未与缓存同步的会话都会丢失
- 使用户无效更复杂
- 托管成本高

#### JWT 实现

<!-- Let us look on how we can approach the same situation with JWT implementation -->

让我们来看看如何通过 JWT 实现来处理相同的情况。

<!-- Instead of using session ids in cookies and session matching in the server memory; we can use JWT to do this instead. So when the user sign in to our application the server will not generate a session id and save it in memory instead it will create a JWT token and it will encode and serialise it and signs it with its own encryption mechanism. This way the server will know if it got changed or manipulated it will become invalid. And this is being checked since it has been signed by the server encryption mechanism. -->

不同于在 Cookie 中使用 Session Id 与服务器内存中的 Session 相匹配; 我们可以使用 JWT 来代替它。因此，当用户登录到我们的应用程序时，服务器将不会生成 Session Id 并将其保存在内存中，而是会创建一个 JWT token，并对其进行编码和序列化，然后使用自己的加密机制对其进行签名。通过这种方式，服务将知道一旦对它进行了变更或篡改，便将其变为无效。这是可以被核验的，是由于通过服务器的加密机制对其进行了签名。

![Implementation with JWT Multiple Servers](/assets/images/202103/implementation-with-jwt-multiple.png)

<!-- Scalability is much easier to manage with JWT as we don't require the server to handle any session checks or cache check. Requests can go to any server the load balancer assign it without the need to worry about session availability. Incase 1 server fails all tokens will still be valid as the encryption mechanism is the same on all servers. -->

使用 JWT 可以更容易地管理可伸缩性，因为我们不需要服务器来处理任何会话检查或缓存检查。请求可以转到负载均衡器为其分配的任何服务器，而不需要担心会话可用性。万一某台服务器宕机，所有 token 将仍然有效，因为所有服务器上的加密机制是相同的。

<!-- Let us do a quick summary on JWT vs SessionId -->

### 让我们来快速总结一下 JWT 和 Session Id 的区别

#### JWT

<!-- Nothing is saved on the server, its stored in the client inside the JWT
Encrypted and Signed by the server
Token contain all the user information
All information are stored in the token itself -->

- 服务器上没有保存任何东西，而是存储在客户端的 JWT 中
- 由服务器加密和签名
- Token 包含用户的所有信息
- 所有信息都存储于 token 本身中

![quick JWT summary](/assets/images/202103/quick-summary-jwt.png)

#### Session Id

<!-- Session id is saved on the server
Encrypted and Signed
Session id is a reference to the user
Server needs to lookup the user information and do the required checks -->

- Session Id 保存在服务器上
- 加密并签名
- Session Id 是对用户的引用
- 服务器需要查找用户并进行必要的检查

![quick Session Id summary](/assets/images/202103/quick-summary-session.png)

## JWT 结构

<!-- JSON Web Tokens consist of three parts separated by dots (.), which are: -->

JSON Web Token 由三部分组成，以点（.）分隔，分别是：

- Header（头）
- Payload（有效负载）
- Signature（签名）

Therefore, a JWT typically looks like the following.

因此，JWT 通常如下所示：

```plain
xxxxxx.yyyyyyy.zzzzzzzz
```

This separation will make it visually easier to see the different part of the tokens. Let's break down the different parts.

这种分离使从视觉上更容易看出 token 的不同部分，让我们分解一下不同的部分。

### Header

<!-- The header typically consists of two parts:

the type of the token, which is JWT,
the signing algorithm being used, such as HMAC SHA256 or RSA. -->

Header 通常由两部分组成：

- token 的类型，这里是 JWT
- 使用的签名算法，比如 HMAC、SHA256 或 RSA。

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

<!-- Then, this JSON is Base64Url encoded to form the first part of the JWT. -->

然后，此 JSON 以 Base64Url 编码，形成 JWT 的第一部分。

### Payload (Data)

<!-- The second part of the token is the payload, which contains the claims. Claims are statements about an entity (typically, the user) and additional data. There are three types of claims: registered, public, and private claims. -->

token 的第二部分是有效负载，其中包含声明（Claims）。Claims 是有关实体（通常是用户）和其他数据的声明。有三种类型的 Claims：registered、public 和 private claims。

<!-- - Registered claims: These are a set of predefined claims which are not mandatory but recommended, to provide a set of useful, interoperable claims. Some of them are: iss (issuer), exp (expiration time), sub (subject), aud (audience), and others. 
- Public claims: These can be defined at will by those using JWTs. But to avoid collisions they should be defined in the IANA JSON Web Token Registry or be defined as a URI that contains a collision resistant namespace.
- Private claims: These are the custom claims created to share information between parties that agree on using them and are neither registered or public claims.
-->

- **Registered claims**：这些是一组非强制性的但建议使用的预定义声明，以提供一组有用的、可互操作的声明。其中包含：iss (issuer，签发者)、exp (expiration time，过期时间)、sub (subject，主题)、aud (audience，受众) 等。
- **Public claims**：这些可以由使用 JWT 的人员随意定义。但是为了避免冲突，应该在 [IANA JSON Web Token Registry](https://www.iana.org/assignments/jwt/jwt.xhtml) 中定义它们，或者将其定义为包含抗冲突命名空间的 URI。
- **Private claims**：这些是自定义声明，是为了在同意使用它们的双方共享信息而创建的，它们既不是注册的声明，也不是公共的声明。

举一个有效负载的例子：

```json
{
  "sub": "221122112",
  "name": "Mohamd Lawand",
  "admin": true,
  "exp": 15323232,
  "iat": 14567766 // 该 token 的签发时间
}
```

<!-- The payload is then Base64Url encoded to form the second part of the JSON Web Token. -->

然后，对有效负载进行 Base64Url 编码，形成 JSON Web Token 的第二部分。

<!-- > Do not put secret information in the payload or header elements of a JWT unless it is encrypted. -->

> 除非将其加密，否则请不要将机密信息放入 JWT 的 Payload 或 Header 元素中。

## 签名

<!-- This will allow us to verify that the token is valid and no changes has been done to it. The way it works it takes the first 2 parts of the token, it will encode the header to base64 and do the same for the payload. Then it will concatenate it with a "." so that way we have all of the data that we have shared with the user. -->

签名使我们能够验证 token 是否有效和和没有被篡改。它的工作方式是获取 token 的前两部分，将 Header 和 Payload 分别编码为 Base64，然后将它们用 “.” 连接起来。这样我们就拥有了与用户共享的所有数据。

<!-- Then it will take the algorithm provide and apply it on the first part. If the result of hashing the first couple of parts match the 3rd section of the token it means the JWT is valid. if it didn't match it shows the token has been edited and its invalid. -->

然后，将获取在第一部分中提供的算法并应用于前面的连接结果。如果前两部分的哈希结果与 token 的第三部分匹配，则表示此 JWT 是有效的; 如果不匹配，则表示此 token 被修改过，是无效的。

<!-- The only way to compromise this is making the secret key available anywhere other than the server. But if we keep the secret safe nothing can compromise the process. -->

这种方案的唯一威胁是密钥在服务器以外的任何地方都可用。但是，如果我们保证密钥的安全，就没有什么能损害这一过程。

```csharp
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret)
```

<!-- The signature is used to verify the message wasn't changed along the way, and, in the case of tokens signed with a private key, it can also verify that the sender of the JWT is who it says it is. -->

签名用于验证消息在传输过程中没有被篡改，并且由于 token 是用私钥签名的，它还可以验证 JWT 发送者的真实身份。

<!-- This works alot similar to password hashing, where we have 2 parts that are combined and we are using certain algorithms to do 1 way hashing, and then we are comparing the outcome of the hash together to see if they are valid or not. -->

它的工作原因与密码哈希非常相似，我们将两部分组合在一起，并且使用特定的算法进行单向哈希，然后我们比较哈希的结果看它们是否有效。

## 签名密钥

<!-- So now lets discuss JWT in more details, first how JWTs can be signed by -->

因此，现在让我们更详细地讨论一下 JWT，首先是通过什么方式对 JWT 进行签名的

<!-- - a secret (with the HMAC algorithm)
- a public/private key pair using RSA or ECDSA. -->

- 一个 secret（使用 HMAC 算法）
- 一个 公钥/私钥对（使用 RSA 或 ECDSA）

<!-- Signed tokens can verify the integrity of the claims contained within it, while encrypted tokens hide those claims from other parties. -->

签名的 token 可以验证其中包含的 Claims 的完整性，而加密的 token 则可以向其他方隐藏这些 Claims。

<br />

> 作者 ： Mohamad Lawand  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://dev.to/moe23/intro-to-jwt-mcb)
