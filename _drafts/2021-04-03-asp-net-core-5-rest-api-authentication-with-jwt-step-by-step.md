---
layout: post
title:  "Asp.Net Core 5 REST API 使用 JWT 身份验证 - Step by Step"
date:   2021-04-03 00:10:09 +0800
categories: dotnet csharp
published: true
---

> 翻译自 Mohamad Lawand 2021年1月22日的文章 [《Asp Net Core 5 Rest API Authentication with JWT Step by Step》](https://dev.to/moe23/asp-net-core-5-rest-api-authentication-with-jwt-step-by-step-140d) [^1]

[^1]: <https://dev.to/moe23/asp-net-core-5-rest-api-authentication-with-jwt-step-by-step-140d> Asp Net Core 5 Rest API Authentication with JWT Step by Step

<!-- In this post i will be showing you How to add JWT authentication to our Asp.Net Core REST API

Some of the topics we will cover are registration, login functionalities and utilising JWTs ("Json Web Tokens") and Bearer authentication. -->

在本文中，我将向您展示如何向我们的 Asp.Net Core REST API 添加 JWT 身份验证。

我们将介绍的主题包含注册、登录功能以及如何使用 JWT (Json Web Tokens) 和 Bearer 身份验证。

你也可以在 YouTube 上[观看完整的视频](https://youtu.be/LgpC4tYtc6Y)[^video]，还可以[下载源代码](https://github.com/mohamadlawand087/v7-RestApiNetCoreAuthentication)[^source]。

[^video]: <https://youtu.be/LgpC4tYtc6Y>

[^source]: <https://github.com/mohamadlawand087/v7-RestApiNetCoreAuthentication>

这是 API 开发系列的第二部分，本系列还包含：

- Part 1：[Asp.Net Core 5 REST API - Step by Step](https://dev.to/moe23/asp-net-core-5-rest-api-step-by-step-2mb6)
- Part 3：[Asp Net Core 5 REST API 中使用 RefreshToken 刷新 JWT - Step by Step](https://dev.to/moe23/refresh-jwt-with-refresh-tokens-in-asp-net-core-5-rest-api-step-by-step-3en5)

<!-- We will be basing our current work on our previous Todo REST API application that we have created in our last article (https://dev.to/moe23/asp-net-core-5-rest-api-step-by-step-2mb6). -->

我们将基于[上一篇文章](https://dev.to/moe23/asp-net-core-5-rest-api-step-by-step-2mb6) 中创建的 Todo REST API 应用程序进行当前的工作，您可以通过阅读上一篇文章并与我一起构建应用程序，或者您可以从 github [下载源代码](https://github.com/mohamadlawand087/v6-RestApiNetCore5)。

前一篇文章中的代码准备好以后，就让我们开始本文吧。

![Asp Net Core 5 REST API Authentication with JWT](/assets/images/202104/asz47zt2t3mzqlz227c1.png)

<!-- The first thing we need to install some package to utilise authentication -->

首先，我们需要安装一些依赖包以使用身份验证：

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer 
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore 
dotnet add package Microsoft.AspNetCore.Identity.UI
```

<!-- then we need to do is we need to update our appsettings.json, in our appsettings we will need to add a JWT settings section and within that settings we need to add a JWT secret -->

然后，我们需要做的就是更新 *appsettings.json*，我们需要在 *appsettings* 中添加 JWT 设置部分，在该设置中添加一个 JWT secret。

```json
"JwtConfig": {
    "Secret" : "ijurkbdlhmklqacwqzdxmkkhvqowlyqa"
},
```

<!-- In order for us to generate our secret we are going to use a free web tool to generate a random 32 char string https://www.browserling.com/tools/random-string -->

为了生成 secret，我们将使用一个免费的 Web 工具（<https://www.browserling.com/tools/random-string>）来生成一个随机的 32 个字符的字符串。

<!-- After adding the randomly generate 32 char string in our app settings now we need to create a new folder in our root directory called configuration. -->

在我们的 appsettings 中添加完随机生成的 32 个字符的字符串后，现在我们需要在根目录中创建一个名为 *Configuration* 的新文件夹。

<!-- Inside this configuration folder we will create a new class called JwtConfig -->

在这个 *Configuration* 文件夹中，我们将创建一个名为 `JwtConfig` 的新类：

```csharp
public class JwtConfig
{
    public string Secret { get; set; }
}
```

<!-- Now we need to update our startup class, inside our ConfigureServices method we need to add the below in order to inject our JwtConfiguration in our application -->

现在我们需要更新 `Startup` 类，在 `ConfigureServices` 方法内，我们需要添加以下内容，以便将 JwtConfiguration 注入到应用程序中：

```csharp
services.Configure<JwtConfig>(Configuration.GetSection("JwtConfig"));
```

<!-- Adding these configuration in our startup class register the configurations in our Asp.Net core middlewear and in our IOC container. -->

将这些配置添加到我们的 `Startup` 类中，即可在 [Asp.Net](http://asp.net/) Core 中间件和 IoC 容器中注册配置。

The next step is adding and configuring authentication in our startup class, inside our ConfigureServices method we need to add the following

下一步是在我们的 `Startup` 类中添加和配置身份验证，在我们的 `ConfigureServices` 方法中，我们需要添加以下内容：

```csharp
// 在本段中，我们将配置身份验证并设置默认方案
services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(jwt => {
    var key = Encoding.ASCII.GetBytes(Configuration["JwtConfig:Secret"]);

    jwt.SaveToken = true;
    jwt.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuerSigningKey = true, //这将使用我们在 appsettings 中添加的 secret 来验证 JWT token 的第三部分，并验证 JWT token 是由我们生成的
        IssuerSigningKey = new SymmetricSecurityKey(key), //将密钥添加到我们的 JWT 加密算法中
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        RequireExpirationTime = false
    };
});

services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
            .AddEntityFrameworkStores<ApiDbContext>();
```

<!-- After updating the ConfigureServices we need to update the Configure method by adding authentication -->

更新 `ConfigureServices` 之后，我们需要更新 `Configure` 方法，添加身份验证：

```csharp
app.UseAuthentication();
```

Once we add the configurations we need to build the application to see if everything is still building as it should.

配置添加完成后，我们需要构建应用程序，以查看是否所有的内容都可以正常构建：

```bash
dotnet build
dotnet run
```

<!-- The next step is to update our ApiDbContext to take advantage of the Identity provider that Asp.Net provide for us, will navigate to our ApiDbContext in the Data folder and we update the ApiDbContext class as the following -->

下一步是更新我们的 `ApiDbContext`，以使用 Asp.Net 为我们提供的身份提供程序，导航到 *Data* 文件夹中的`ApiDbContext`，然后按以下内容更新 `ApiDbContext` 类：

```csharp
public class ApiDbContext : IdentityDbContext
```

<!-- by inheriting from IdentityDbContext instead of DbContext, EntityFramework will know that we are using authentication and it will build the infrastructure for us to utilise the default identity tables. -->

通过从 `IdentityDbContext` 而不是 `DbContext` 继承，EntityFramework 将知道我们正在使用身份验证，并且将为我们构建基础结构以使用默认身份表。

<!-- To Generate the identity tables in our database we need to prepare migrations scripts and run them. to do that inside the terminal we need to type the following -->

要在我们的数据库中生成身份表，我们需要准备迁移脚本并运行它们。要做到这些，我们需要在终端中输入并运行以下命令：

```bash
dotnet ef migrations add "Adding authentication to our Api"
dotnet ef database update
```

<!-- Once our migrations is completed we can open our database app.db with Dbeaver and we can see that our identity tables has been created for us by Entity Framework -->

迁移完成后，我们可以使用 Dbeaver 打开数据库 *app.db*，我们可以看到 EntityFramework 已经为我们创建了身份表。

The next step will be to setup out controllers and build the registration process for the user. Inside out controller folder will need to create a controller and our DTOs (data transfer objects).

下一步将是设置控制器并为用户构建注册流程。我们需要在 *Controllers* 文件夹中创建一个新的控制器，并创建对应的 DTO 类（Data Transfer Objects）。

<!-- Will start by adding a new folder called Domain in our root directory, and we add a class called AuthResult -->

首先在根目录中添加一个名为 *Domain* 的新文件夹，然后添加一个名为 `AuthResult` 的类：

```csharp
public class AuthResult
{
    public string Token { get; set; }
    public bool Success { get; set; }
    public List<string> Errors { get; set; }
}
```

<!-- Will start by adding some folders to organise our DTOs, inside the Models folder will add a folder called DTO and within the DTO folder will create 2 folders Requests/Responses -->

我将添加一些文件夹来组织 DTOs，在 *Models* 文件夹中添加一个名为 *DTOs* 的文件夹，然后在此文件夹中创建两个文件夹 *Requests* 和 *Responses*。

<!-- We need to add the UserRegistrationRequestDto which will be used by our registration action in the Controller. Then will navigate to Models/DTO/Requests and add a new class called UserRegistrationRequestDto -->

我们需要添加供我们在控制器中的注册操作使用的 `UserRegistrationDto`。导航到 *Models/DTO/Requests*，添加一个新类 `UserRegistrationDto`。

`Models\DTOs\Requests\UserRegistrationDto.cs`

```csharp
public class UserRegistrationDto
{
    [Required]
    public string Username { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
}
```

`Models\DTOs\Responses\RegistrationResponse.cs`

```csharp
public class RegistrationResponse : AuthResult
{
    
}
```

<!-- Now we need to add our user registration controller, inside our controller folder we add a new class we call it AuthManagementController and we update it with the code below -->

现在，我们需要添加用户注册控制器，在控制器文件夹内，我们添加一个新类，命名为 `AuthManagementController`，并使用以下代码更新它：

```csharp
[Route("api/[controller]")] // api/authManagement
[ApiController]
public class AuthManagementController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly JwtConfig _jwtConfig;

    public AuthManagementController(
        UserManager<IdentityUser> userManager,
        IOptionsMonitor<JwtConfig> optionsMonitor)
    {
        _userManager = userManager;
        _jwtConfig = optionsMonitor.CurrentValue;
    }

    [HttpPost]
    [Route("Register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationDto user)
    {
        // 检查传入请求是否有效
        if(ModelState.IsValid)
        {
            // 检查使用相同电子邮箱的用户是否存在
            var existingUser = await _userManager.FindByEmailAsync(user.Email);

            if(existingUser != null)
            {
                return BadRequest(new RegistrationResponse(){
                        Errors = new List<string>() {
                            "Email already in use"
                        },
                        Success = false
                });
            }

            var newUser = new IdentityUser() { Email = user.Email, UserName = user.Username};
            var isCreated = await _userManager.CreateAsync(newUser, user.Password);
            if(isCreated.Succeeded)
            {
                var jwtToken =  GenerateJwtToken( newUser);

                return Ok(new RegistrationResponse() {
                    Success = true,
                    Token = jwtToken
                });
            } else {
                return BadRequest(new RegistrationResponse(){
                        Errors = isCreated.Errors.Select(x => x.Description).ToList(),
                        Success = false
                });
            }
        }

        return BadRequest(new RegistrationResponse(){
                Errors = new List<string>() {
                    "Invalid payload"
                },
                Success = false
        });
    }

    

    private string GenerateJwtToken(IdentityUser user)
    {
        //现在，是时候定义 jwt token 了，它将负责创建我们的 tokens
        var jwtTokenHandler = new JwtSecurityTokenHandler();

        // 从 appsettings 中获得我们的 secret 
        var key = Encoding.ASCII.GetBytes(_jwtConfig.Secret);

        // 定义我们的 token descriptor
        // 我们需要使用 claims （token 中的属性）给出关于 token 的信息，它们属于特定的用户，
        // 因此，可以包含他们的 Id、名字、邮箱。
        // 好消息是，这些信息由我们的服务器和 identity framework 生成，它们是有效且可信的。
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new []
            {
                new Claim("Id", user.Id), 
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                // Jti 用于刷新 token，我们将在下一篇中进行讲到
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            }),
            // token 的过期时间需要缩短，并利用 refresh token 来保持用户的登录状态
            // 但由于这只是一个演示应用，我们可以对其进行延长以适应我们当前的需求
            Expires = DateTime.UtcNow.AddHours(6),
            // 这里我们添加了加密算法信息，用于加密我们的 token
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = jwtTokenHandler.CreateToken(tokenDescriptor);
        var jwtToken = jwtTokenHandler.WriteToken(token);

        return jwtToken;
    }
}
```

Once we finish the registration action we can now test it in postman and get the jwt token

完成注册 Action 后，我们可以在 Postman 中对其进行测试并获得 JWT token。

<!-- So the next step will be creating the user login request. -->

下一步是创建用户登录请求。

`Models\DTOs\Requests\UserLoginRequest.cs`

```csharp
public class UserLoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
}
```

After that we need to add our login action in the AuthManagementControtller

然后，我们需要在 `AuthManagementController` 中添加 Login 方法：

```csharp
[HttpPost]
[Route("Login")]
public async Task<IActionResult> Login([FromBody] UserLoginRequest user)
{
    if(ModelState.IsValid)
    {
        // 检查使用相同电子邮箱的用户是否存在
        var existingUser = await _userManager.FindByEmailAsync(user.Email);

        if(existingUser == null) 
        {
            // 出于安全原因，我们不想透露太多关于请求失败的信息
            return BadRequest(new RegistrationResponse()
            {
                Errors = new List<string>() {
                    "Invalid login request"
                },
                Success = false
            });
        }

        // 现在我们需要检查用户是否输入了正确的密码
        var isCorrect = await _userManager.CheckPasswordAsync(existingUser, user.Password);

        if(!isCorrect) 
        {
            // 出于安全原因，我们不想透露太多关于请求失败的信息
            return BadRequest(new RegistrationResponse()
            {
                Errors = new List<string>() {
                    "Invalid login request"
                },
                Success = false
            });
        }

        var jwtToken = GenerateJwtToken(existingUser);

        return Ok(new RegistrationResponse() 
        {
            Success = true,
            Token = jwtToken
        });
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
```

<!-- now we can test it out and we can see that our jwt tokens has been generated successfully, the next step is to secure our controller, to do that all we need to do is add the Authorise attribute to the controller -->

现在我们可以对其进行测试，我们可以看到 JWT token 已经成功生成。下一步是保护我们的控制器，要做的就是在向控制器添加 `Authorise` 属性。

```csharp
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[Route("api/[controller]")] // api/todo
[ApiController]
public class TodoController : ControllerBase
```

<!-- And now if we test it we are not able to execute any request since we are not authorised, in order for us to send authorised requests we need to add the authorisation header with the bearer token so that Asp.Net can verify it and give us permission to execute the actions -->

现在，如果我们对其进行测试，则由于未获得授权，我们将无法执行任何请求，为了发送带授权的请求，我们需要添加带有 Bearer token 的授权标头，以便 Asp.Net 可以难它，并给我们执行操作的权限。

感谢您花时间阅读本文。

本文是 API 开发系列的第二部分，后面会有第二、第三部分。

<br />

> 作者 ： Mohamad Lawand  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://dev.to/moe23/asp-net-core-5-rest-api-authentication-with-jwt-step-by-step-140d)
