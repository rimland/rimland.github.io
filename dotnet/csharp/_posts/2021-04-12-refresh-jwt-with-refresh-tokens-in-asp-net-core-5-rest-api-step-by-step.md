---
layout: post
title:  "Asp Net Core 5 REST API 使用 RefreshToken 刷新 JWT - Step by Step"
date:   2021-04-12 00:10:09 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Mohamad Lawand 2021年1月22日的文章 [《Refresh JWT with Refresh Tokens in Asp Net Core 5 Rest API Step by Step》](https://dev.to/moe23/refresh-jwt-with-refresh-tokens-in-asp-net-core-5-rest-api-step-by-step-3en5) [^1]

[^1]: <https://dev.to/moe23/refresh-jwt-with-refresh-tokens-in-asp-net-core-5-rest-api-step-by-step-3en5> Refresh JWT with Refresh Tokens in Asp Net Core 5 Rest API Step by Step

在本文中，我将向您演示如何在 Asp.Net Core REST API 中将 Refresh Token 添加到 JWT 身份验证。

我们将覆盖的一些主题包含：Refresh Token、一些新的 Endpoints 功能和 JWT（JSON Web Token）。

你也可以在 YouTube 上[观看完整的视频](https://youtu.be/T_Hla1WzaZQ)[^video]，还可以[下载源代码](https://github.com/mohamadlawand087/v8-refreshtokenswithJWT)[^source]。

[^video]: <https://youtu.be/T_Hla1WzaZQ>

[^source]: <https://github.com/mohamadlawand087/v8-refreshtokenswithJWT>

这是 REST API 开发系列的第三部分，前面还有：

- Part 1：[Asp.Net Core 5 REST API - Step by Step](https://ittranslator.cn/dotnet/csharp/2021/04/06/asp-net-core-5-rest-api-step-by-step.html)
- Part 2：[Asp.Net Core 5 REST API 使用 JWT 身份验证 - Step by Step](https://ittranslator.cn/dotnet/csharp/2021/04/08/asp-net-core-5-rest-api-authentication-with-jwt-step-by-step.html)

![Refresh JWT with Refresh Tokens in Asp Net Core 5 Rest API](https://ittranslator.cn/assets/images/202104/0j4sfmo5qefqt7s0m7vx.png)

<!-- This is part 3 of our Rest API journey, and we will be basing our current work on our previous Todo REST API application that we have created in our last article, https://dev.to/moe23/asp-net-core-5-rest-api-authentication-with-jwt-step-by-step-140d. You can follow along by either going through the article and building the application with me as we go or you can get the source code from github. -->

我将基于在[上一篇文章](https://ittranslator.cn/dotnet/csharp/2021/04/08/asp-net-core-5-rest-api-authentication-with-jwt-step-by-step.html)中创建的 Todo REST API 应用程序进行当前的讲述。您可以通过阅读上一篇文章并与我一起构建应用程序，或者可以从 github [下载上一篇中的源代码](https://github.com/mohamadlawand087/v7-RestApiNetCoreAuthentication)。

<!-- Before we start implementing the Refresh Token functionality, let us examine how the refresh token logic will work. -->

在开始实现 **Refresh Token** 功能之前，让我们先来了解一下 Refresh Token 的运行逻辑是怎样的。

<!-- By nature JWT tokens have an expiry time, the shorter the time the safer it is. there is 2 options to get new tokens after the JWT token has expired -->

本质上，JWT token 有一个过期时间，时间越短越安全。在 JWT token 过期后，有两种方法可以获取新的 token：

<!-- Ask the user to login again, this is not a good user experience
Use refresh tokens to automatically re-authenticate the user and generate new JWT tokens. -->

1. 要求用户重新登录（这不是一个好的用户体验）。
2. 使用 Refresh Token 自动重新验证用户并生成新的 JWT token。

<!-- So what is a refresh token, a refresh token can be anything from strings to Guids to any combination as long as its unique -->

那么，Refresh Token 是什么呢？*一个 Refresh Token 可以是任何东西，从字符串到 Guid 到任意组合，只要它是唯一的*。

<!-- Why is it important to have a short lived JWT token, if someone is stole our JWT token and started doing requests on the server, that token will only last for an amount of time before it expires and become useless. The only way to get a new token is using the refresh tokens or loging in. -->

为什么短暂生命周期的 JWT token 很重要，这是因为如果有人窃取了我们的 JWT token 并开始请求我们的服务器，那么该 token 在过期（变得不可用）之前只会持续一小段时间。获取新 token 的唯一方法是使用 Refresh Token 或登录。

<!-- Another main point is what happens to all of the tokens that were generated based on an user credentials if the user changes their password. we don't want to invalidate all of the sessions. We can just update the refresh tokens so a new JWT token based on the new credentials will be generated. -->

另一个重点是，如果用户更改了密码，则根据之前的用户凭据生成的所有 token 会怎样呢。我们并不想使所有会话都失效，我们只需请求刷新 Token，那么将生成一个基于新凭证的新 JWT token。

<!-- 另一个要点是，如果用户更改了密码，则根据用户凭据生成的所有令牌都会发生什么情况。 我们不想使所有会话无效。 我们可以只更新刷新令牌，因此将基于新凭证生成一个新的JWT令牌。
另一个要点是，如果用户更改了密码，那么基于用户凭证生成的所有令牌都将发生什么变化。
我们不想让所有的会话失效。
我们只需更新刷新令牌，这样就会生成一个基于新凭据的新JWT令牌。 -->

<!-- As well a good way to implement automatic refresh tokens is before every request the client makes we need to check the expiry of the token if its expired we request a new one else we use the token we have to perform the request. -->

另外，实现自动刷新 token 的一个好办法是，在客户端发出每个请求之前，都需要检查 token 的过期时间，如果已过期，我们就请求一个新的 token，否则就使用现有的 token 执行请求。

<!-- So in out application instead of just generating just a JWT token with every authorisation we will add a refresh token as well. -->

因此，我们将在应用程序中添加一个 Refresh Token，而不仅仅是在每次授权时都只生成一个 JWT token。

<!-- So lets get started, we will first start by updating our startup class, by making TokenValidationParameters available across the application by adding them to our Dependency Injection Container -->

那么，就让我们开始吧，首先我们将更新 `Startup` 类，通过将 `TokenValidationParameters` 添加到依赖注入容器，使它在整个应用程序中可用。

```csharp
var key = Encoding.ASCII.GetBytes(Configuration["JwtConfig:Secret"]);

var tokenValidationParams = new TokenValidationParameters
{
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(key),
    ValidateIssuer = false,
    ValidateAudience = false,
    ValidateLifetime = true,
    RequireExpirationTime = false,
    ClockSkew = TimeSpan.Zero
};

services.AddSingleton(tokenValidationParams);

services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(jwt =>
{
    jwt.SaveToken = true;
    jwt.TokenValidationParameters = tokenValidationParams;
});
```

<!-- Once the JwtConfig class is updated now we need to update our GenerateJwtToken function in our AuthManagementController our TokenDescriptor Expire value from being fixed to the ExpiryTimeFrame, we need to make it shorter that we have specified -->

更新完 `Startup` 类以后，我们需要更新 `AuthManagementController` 中的 `GenerateJwtToken` 函数，将 `TokenDescriptor` 的 `Expires` 值从之前的值更新为 30 秒（比较合理的值为 5~10 分钟，这里设置为 30 秒只是作演示用），我们需要把它指定的更短一些。

> 译者注：  
> 实际使用时，可以在 *appsettings.json* 中为 JwtConfig 添加一个代表 token 过期时间的 *ExpiryTimeFrame* 配置项，对应的在 `JwtConfig` 类中添加一个 `ExpiryTimeFrame` 属性，然后赋值给 `TokenDescriptor` 的 `Expires`，这样 token 的过期时间就变得可配置了。

```csharp
private string GenerateJwtToken(IdentityUser user)
{
    var jwtTokenHandler = new JwtSecurityTokenHandler();

    var key = Encoding.ASCII.GetBytes(_jwtConfig.Secret);

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim("Id", user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Sub, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        }),
        Expires = DateTime.UtcNow.AddSeconds(30), // 比较合理的值为 5~10 分钟，这里设置 30 秒只是作演示用
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };

    var token = jwtTokenHandler.CreateToken(tokenDescriptor);
    var jwtToken = jwtTokenHandler.WriteToken(token);

    return jwtToken;
}
```

<!-- The step will be to update our AuthResult in our configuration folder, we need to add a new property which will be catered for the refresh token -->

接下来的步骤是更新 *Configuration* 文件夹中的 `AuthResult`，我们需要为 Refresh Token 添加一个新属性：

```csharp
// Configuration\AuthResult.cs

public class AuthResult
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
    public bool Success { get; set; }
    public List<string> Errors { get; set; }
}
```

<!-- We will add a new class called TokenRequest inside our Models/DTOs/Requests which will be responsible on accepting new request for the new endpoint that we will create later on to manage the refresh token -->

我们将在 *Models/DTOs/Requests* 中添加一个名为 `TokenRequest` 的新类，该类负责接收稍后我们将创建的新 Endpoint 的请求参数，用于管理刷新 Token。

```csharp
// Models\DTOs\Requests\TokenRequest.cs

public class TokenRequest
{
    /// <summary>
    /// 原 Token
    /// </summary>
    [Required]
    public string Token { get; set; }
    /// <summary>
    /// Refresh Token
    /// </summary>
    [Required]
    public string RefreshToken { get; set; }
}
```

<!-- The next step is to create a new model called RefreshToken, in our Models folder. -->

下一步是在我们的 *Models* 文件夹中创建一个名为 `RefreshToken` 的新模型。

```csharp
// Models\RefreshToken.cs

public class RefreshToken
{
    public int Id { get; set; }
    public string UserId { get; set; } // 连接到 ASP.Net Identity User Id
    public string Token { get; set; }  // Refresh Token
    public string JwtId { get; set; } // 使用 JwtId 映射到对应的 token
    public bool IsUsed { get; set; } // 如果已经使用过它，我们不想使用相同的 refresh token 生成新的 JWT token
    public bool IsRevorked { get; set; } // 是否出于安全原因已将其撤销
    public DateTime AddedDate { get; set; }
    public DateTime ExpiryDate { get; set; } // refresh token 的生命周期很长，可以持续数月

    [ForeignKey(nameof(UserId))]
    public IdentityUser User {get;set;}
}
```

<!-- Once the model is added we need to update our ApiDbContext -->

 添加 `RefreshToken` 模型后，我们需要更新 `ApiDbContext` 类：

```csharp
public virtual DbSet<RefreshToken> RefreshTokens { get; set; }
```

<!-- Now lets create the migrations for our ApiDbContext so we can reflect the changes in your database -->

现在让我们为 `ApiDbContext` 创建数据库迁移，以便可以反映数据库中的更改：

```bash
dotnet ef migrations add "Added refresh tokens table"
dotnet ef database update
```

<!-- Our next step will be to create our new Endpoind "RefreshToken" in our AuthManagementController. The first thing we need to do is to inject the TokenValidationParameters -->

下一步是在 `AuthManagementController` 中创建一个新的名为 `RefreshToken` 的 Endpoind。需要做的第一件事是注入 `TokenValidationParameters`：

```csharp
private readonly UserManager<IdentityUser> _userManager;
private readonly JwtConfig _jwtConfig;
private readonly TokenValidationParameters _tokenValidationParams;
private readonly ApiDbContext _apiDbContext;

public AuthManagementController(
    UserManager<IdentityUser> userManager,
    IOptionsMonitor<JwtConfig> optionsMonitor,
    TokenValidationParameters tokenValidationParams,
    ApiDbContext apiDbContext)
{
    _userManager = userManager;
    _jwtConfig = optionsMonitor.CurrentValue;
    _tokenValidationParams = tokenValidationParams;
    _apiDbContext = apiDbContext;
}
```

<!-- Once we inject the required parameters we need to update the GenerateToken function to include the refresh token -->

注入所需的参数后，我们需要更新 `GenerateJwtToken` 函数以包含 Refresh Token：

```csharp
private async Task<AuthResult> GenerateJwtToken(IdentityUser user)
{
    var jwtTokenHandler = new JwtSecurityTokenHandler();

    var key = Encoding.ASCII.GetBytes(_jwtConfig.Secret);

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim("Id", user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Sub, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        }),
        Expires = DateTime.UtcNow.AddSeconds(30), // 比较合理的值为 5~10 分钟，这里设置 30 秒只是作演示用
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };

    var token = jwtTokenHandler.CreateToken(tokenDescriptor);
    var jwtToken = jwtTokenHandler.WriteToken(token);

    var refreshToken = new RefreshToken()
    {
        JwtId = token.Id,
        IsUsed = false,
        IsRevorked = false,
        UserId = user.Id,
        AddedDate = DateTime.UtcNow,
        ExpiryDate = DateTime.UtcNow.AddMonths(6),
        Token = RandomString(25) + Guid.NewGuid()
    };

    await _apiDbContext.RefreshTokens.AddAsync(refreshToken);
    await _apiDbContext.SaveChangesAsync();

    return new AuthResult()
    {
        Token = jwtToken,
        Success = true,
        RefreshToken = refreshToken.Token
    };
}

private string RandomString(int length)
{
    var random = new Random();
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return new string(Enumerable.Repeat(chars, length)
        .Select(x => x[random.Next(x.Length)]).ToArray());
}
```

<!-- Now lets update the return to both existing actions as we have changed the return type for GenerateJwtToken -->

现在，让我们更新两个现有 Action 的返回值，因为我们已经更改了 `GenerateJwtToken` 的返回类型

`Login` Action：

```csharp
return Ok(await GenerateJwtToken(existingUser));
```

`Register` Action：

```csharp
return Ok(await GenerateJwtToken(newUser));
```

然后，我们可以开始构建 `RefreshToken` Action：

```csharp
[HttpPost]
[Route("RefreshToken")]
public async Task<IActionResult> RefreshToken([FromBody] TokenRequest tokenRequest)
{
    if (ModelState.IsValid)
    {
        var result = await VerifyAndGenerateToken(tokenRequest);

        if (result == null)
        {
            return BadRequest(new RegistrationResponse()
            {
                Errors = new List<string>() 
                {
                    "Invalid tokens"
                },
                Success = false
            });
        }

        return Ok(result);
    }

    return BadRequest(new RegistrationResponse()
    {
        Errors = new List<string>() 
        {
            "Invalid payload"
        },
        Success = false
    });
}

private async Task<AuthResult> VerifyAndGenerateToken(TokenRequest tokenRequest)
{
    var jwtTokenHandler = new JwtSecurityTokenHandler();

    try
    {
        // Validation 1 - Validation JWT token format
        // 此验证功能将确保 Token 满足验证参数，并且它是一个真正的 token 而不仅仅是随机字符串
        var tokenInVerification = jwtTokenHandler.ValidateToken(tokenRequest.Token, _tokenValidationParams, out var validatedToken);

        // Validation 2 - Validate encryption alg
        // 检查 token 是否有有效的安全算法
        if (validatedToken is JwtSecurityToken jwtSecurityToken)
        {
            var result = jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase);

            if (result == false)
            {
                return null;
            }
        }

        // Validation 3 - validate expiry date
        // 验证原 token 的过期时间，得到 unix 时间戳
        var utcExpiryDate = long.Parse(tokenInVerification.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Exp).Value);

        var expiryDate = UnixTimeStampToDateTime(utcExpiryDate);

        if (expiryDate > DateTime.UtcNow)
        {
            return new AuthResult()
            {
                Success = false,
                Errors = new List<string>() 
                {
                    "Token has not yet expired"
                }
            };
        }

        // validation 4 - validate existence of the token
        // 验证 refresh token 是否存在，是否是保存在数据库的 refresh token
        var storedRefreshToken = await _apiDbContext.RefreshTokens.FirstOrDefaultAsync(x => x.Token == tokenRequest.RefreshToken);

        if (storedRefreshToken == null)
        {
            return new AuthResult()
            {
                Success = false,
                Errors = new List<string>() 
                {
                    "Refresh Token does not exist"
                }
            };
        }

        // Validation 5 - 检查存储的 RefreshToken 是否已过期
        // Check the date of the saved refresh token if it has expired
        if (DateTime.UtcNow > storedRefreshToken.ExpiryDate)
        {
            return new AuthResult()
            {
                Errors = new List<string>() { "Refresh Token has expired, user needs to re-login" },
                Success = false
            };
        }

        // Validation 6 - validate if used
        // 验证 refresh token 是否已使用
        if (storedRefreshToken.IsUsed)
        {
            return new AuthResult()
            {
                Success = false,
                Errors = new List<string>() 
                {
                    "Refresh Token has been used"
                }
            };
        }

        // Validation 7 - validate if revoked
        // 检查 refresh token 是否被撤销
        if (storedRefreshToken.IsRevorked)
        {
            return new AuthResult()
            {
                Success = false,
                Errors = new List<string>() 
                {
                    "Refresh Token has been revoked"
                }
            };
        }

        // Validation 8 - validate the id
        // 这里获得原 JWT token Id
        var jti = tokenInVerification.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti).Value;

        // 根据数据库中保存的 Id 验证收到的 token 的 Id
        if (storedRefreshToken.JwtId != jti)
        {
            return new AuthResult()
            {
                Success = false,
                Errors = new List<string>() 
                {
                    "The token doesn't mateched the saved token"
                }
            };
        }

        // update current token 
        // 将该 refresh token 设置为已使用
        storedRefreshToken.IsUsed = true;
        _apiDbContext.RefreshTokens.Update(storedRefreshToken);
        await _apiDbContext.SaveChangesAsync();

        // 生成一个新的 token
        var dbUser = await _userManager.FindByIdAsync(storedRefreshToken.UserId);
        return await GenerateJwtToken(dbUser);
    }
    catch (Exception ex)
    {
        if (ex.Message.Contains("Lifetime validation failed. The token is expired."))
        {
            return new AuthResult()
            {
                Success = false,
                Errors = new List<string>() 
                {
                    "Token has expired please re-login"
                }
            };
        }
        else
        {
            return new AuthResult()
            {
                Success = false,
                Errors = new List<string>() 
                {
                    "Something went wrong."
                }
            };
        }
    }
}

private DateTime UnixTimeStampToDateTime(long unixTimeStamp)
{
    var dateTimeVal = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
    dateTimeVal = dateTimeVal.AddSeconds(unixTimeStamp).ToLocalTime();
    return dateTimeVal;
}
```

<!-- Finally we need to make sure everything still builds and run -->

最后，我们需要确保一切可以正常构建和运行。

```csharp
dotnet build
dotnet run
```

<!-- Once we make sure everything is as it should be we will test the app using postman, the testing scenarios will be as follow: -->

当我们确定一切 OK 后，我们可以使用 Postman 测试应用程序，测试场景如下所示：

<!-- - login in generating a JWT token with a refresh token ⇒ fail
- directly try to refresh the token without waiting for it to expire ⇒ fail
- waiting for the JWT token to expire and request a refresh token ⇒ Success
- re-using the same refresh token ⇒ fail -->

- 登录，生成带有刷新令牌的 JWT 令牌 ⇒ 成功
- 不等待令牌过期而直接尝试刷新令牌 ⇒ 失败
- 等待 JWT 令牌过期然后请求刷新令牌 ⇒ 成功
- 重新使用相同的刷新令牌 ⇒ 失败

感谢您花时间阅读本文。

本文是 API 开发系列的第三部分，你可以通过下面链接阅读前两部分：

- Part 1：[Asp.Net Core 5 REST API - Step by Step](https://ittranslator.cn/dotnet/csharp/2021/04/06/asp-net-core-5-rest-api-step-by-step.html)
- Part 2：[Asp.Net Core 5 REST API 使用 JWT 身份验证 - Step by Step](https://ittranslator.cn/dotnet/csharp/2021/04/08/asp-net-core-5-rest-api-authentication-with-jwt-step-by-step.html)

<br/>

> 作者 ： Mohamad Lawand  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://dev.to/moe23/refresh-jwt-with-refresh-tokens-in-asp-net-core-5-rest-api-step-by-step-3en5)
