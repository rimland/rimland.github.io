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

    [HttpPost]
    [Route("Login")]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest user)
    {
        if(ModelState.IsValid)
        {
            var existingUser = await _userManager.FindByEmailAsync(user.Email);

            if(existingUser == null) {
                    return BadRequest(new RegistrationResponse(){
                        Errors = new List<string>() {
                            "Invalid login request"
                        },
                        Success = false
                });
            }

            var isCorrect = await _userManager.CheckPasswordAsync(existingUser, user.Password);

            if(!isCorrect) {
                    return BadRequest(new RegistrationResponse(){
                        Errors = new List<string>() {
                            "Invalid login request"
                        },
                        Success = false
                });
            }

            var jwtToken  =GenerateJwtToken(existingUser);

            return Ok(new RegistrationResponse() {
                Success = true,
                Token = jwtToken
            });
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
        if(ModelState.IsValid)
        {
            // We can utilise the model
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

    [HttpPost]
    [Route("Login")]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest user)
    {
        if(ModelState.IsValid)
        {
            var existingUser = await _userManager.FindByEmailAsync(user.Email);

            if(existingUser == null) {
                    return BadRequest(new RegistrationResponse(){
                        Errors = new List<string>() {
                            "Invalid login request"
                        },
                        Success = false
                });
            }

            var isCorrect = await _userManager.CheckPasswordAsync(existingUser, user.Password);

            if(!isCorrect) {
                    return BadRequest(new RegistrationResponse(){
                        Errors = new List<string>() {
                            "Invalid login request"
                        },
                        Success = false
                });
            }

            var jwtToken  =GenerateJwtToken(existingUser);

            return Ok(new RegistrationResponse() {
                Success = true,
                Token = jwtToken
            });
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
        var jwtTokenHandler = new JwtSecurityTokenHandler();

        var key = Encoding.ASCII.GetBytes(_jwtConfig.Secret);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new []
            {
                new Claim("Id", user.Id), 
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            }),
            Expires = DateTime.UtcNow.AddHours(6),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = jwtTokenHandler.CreateToken(tokenDescriptor);
        var jwtToken = jwtTokenHandler.WriteToken(token);

        return jwtToken;
    }
}
```




























在开始之前，我们需要准备的四样东西：

- Visual Studio code (<https://code.visualstudio.com/>)
- Dotnet core SDK (<https://dotnet.microsoft.com/download>)
- Postman (<https://www.postman.com/downloads/>)
- DBeaver (<https://dbeaver.io/download/>)

<!-- Once we have downloaded and installed all of the required tool, we need to make sure that the dotnet SDK has been installed successfully, we need to open the terminal and check if the dotnet SDK is installed successfully by checking the dotnet version -->

下载并安装了所有必需的工具后，我们需要确保 dotnet SDK 已成功安装，我们需要打开终端并通过检查 dotnet 版本来检查 dotnet SDK 是否已成功安装。

打开终端，输入以下命令：

```bash
dotnet --version
```

<!-- Now we need to install the entity framework tool -->

现在，我们需要安装 EntityFramework 工具：

```bash
dotnet tool install --global dotnet-ef
```

<!-- Once thats finish we need to create our application -->

完成后，我们需要创建我们的应用程序：

```bash
dotnet new webapi -n "TodoApp" -lang "C#" -au none
```

<!-- Now lets add the packages that we will nee in order of us to utilise the EntityFramrwork and SQLite -->

现在让我们添加需要使用的包，以便可以使用 EntityFramrwork 和 SQLite：

```bash
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

<!-- Now lets open VS code and check our application and check the source code, lets build the application and see if its running -->

现在，请打开 VS Code 并检查我们的应用程序和源代码，然后，让我们构建应用程序并查看其是否可以运行：

```bash
dotnet build
dotnet run
```

<!-- We start by removing the default template code that was generated by the .Net core framework for us. Will dlete the WeatherForcastController and the WeatherForcast class. -->

首先，我们删除由 .Net Core 框架为我们生成的默认模板代码，即删除 `WeatherForcastController` `和WeatherForcast` 类。

接着，我们创建自己的控制器，将其命名为 `TodoController`。

<!-- Will create our first simple action will call it TestRun, lets start coding our controller -->

然后，我们创建第一个简单的 `Action`，将其命名为 `TestRun`，让我们开始为我们的控制器编码：

```csharp
[Route("api/[controller]")] // 我们定义控制器要使用的路由
[ApiController] // 我们需要指定控制器的类型以让 .Net core 知道
public class TodoController : ControllerBase
{
    [Route("TestRun")] // 定义此 Action 的路由
    [HttpGet]
    public ActionResult TestRun()
    {
        return Ok("success");
    }
}
```

<!-- Once we finish adding we need to test it, in order for us to do that we need to do the following -->

创建完成后，我们需要对其进行测试，为了测试，我们需要执行以下操作：

```bash
dotnet build
dotnet run
```

<!-- Once the application is running we need to open postman and try it there see we get the response. -->

应用程序运行起来后，我们可以打开 Postman 试一下看看我们获得的响应。

<!-- we create a new request in postman and set the type to get and we add the following URL: -->

我们在 Postman 中创建一个新请求，并将类型设置为 `GET`，然后请求以下 URL：

```text
https://localhost:5001/api/todo/testrun
```

正如您在 TestRun 中看到的那样，我们在 Postman 中得到了 “success” 响应。

<!-- After testing it we now need to start adding models, we add a models folder in the root directory and we add a class inside of it called Item. This is going to be a very simple model which represent our todo list item. -->

测试完之后，我们现在需要开始添加模型，我们在根目录中添加一个 *Models* 文件夹，并在其中添加一个名为 `ItemData` 的类。这是一个非常简单的模型，它表示我们的待办事项的列表项。

```csharp
public class ItemData
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public bool Done { get; set; }
}
```

<!-- once we add our model now we need to build our ApiDbContext. We need to create a Data folder in our root directory and inside this folder will create a new class called ApiDbContext. -->

添加好模型后，我们需要构建 `ApiDbContext`。在根目录中创建一个 *Data* 文件夹，然后在该文件夹中创建一个名为 `ApiDbContext` 的新类。

```csharp
public class ApiDbContext : DbContext
{
    public virtual DbSet<ItemData> Items {get;set;}

    public ApiDbContext(DbContextOptions<ApiDbContext> options)
        : base(options)
    {
        
    }
}
```

<!-- We need to specify our connection string inside the appsetting.json application -->

然后，我们需要在 `appsetting.json` 中指定连接字符串：

```json
"ConnectionStrings": {
  "DefaultConnection" : "DataSource=app.db; Cache=Shared"
}
```

<!-- Perfect once our DbContext and connection string is ready we need to update the startup class so we can utilise the Application DbContext inside our application. Open the startup class in our root folder and add the following code. -->

完善 DbContext 和连接字符串后，我们需要更新 `Startup` 类，以便可以在应用程序中使用 Application DbContext。在我们的根目录中打开 `Startup` 类，然后添加以下代码：

```csharp
services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(
        Configuration.GetConnectionString("DefaultConnection")
    ));
```

<!-- Once we have add the DbContext middleware we need to add the initial migration to create the database. -->

添加好 DbContext 中间件后，我们需要添加初始化迁移来创建数据库。

```bash
dotnet ef migrations add "Initial Migrations"
dotnet ef database update
```

<!-- After the database update has completed successfully we can see we have a new folder called migrations which will contain the C# script which will be responsible on creating the database and its table Item. we can verify that the database has been created since we can see the app.db file in our root directory as well we can see that use the SQLite browser to verify that the table has been created successfully. -->

成功完成数据库更新后，我们可以看到有一个名为 *Migrations* 的新文件夹，它将包含 C# 脚本，该脚本将负责创建数据库及其表 `Items`。我们可以在根目录中看到 *app.db* 文件，也可以使用 SQLite 查看工具来验证表是否已成功创建，由此我们可以验证数据库是否已创建。

<!-- Now that we have completed all of the infrastructure work for our controller. Now we need to start building our TodoController and connect it to the ApiDbContext. -->

现在，我们已经完成了控制器的所有基础设施的搭建。现在，我们需要开始构建 `TodoController` 并将其连接到`ApiDbContext`。

<!-- Will start by adding the get all items in our todo list -->

我们从添加获取待办事项中的所有项的方法 `GetItems` 开始，依次添加所有需要的方法：

```csharp
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.Data;
using TodoApp.Models;

namespace TodoApp.Controllers
{
    [Route("api/[controller]")] // api/todo
    [ApiController]
    public class TodoController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public TodoController(ApiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetItems()
        {
            var items = await _context.Items.ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> CreateItem(ItemData data)
        {
            if (ModelState.IsValid)
            {
                await _context.Items.AddAsync(data);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetItem", new { data.Id }, data);
            }

            return new JsonResult("Something went wrong") { StatusCode = 500 };
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            var item = await _context.Items.FirstOrDefaultAsync(x => x.Id == id);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, ItemData item)
        {
            if (id != item.Id)
                return BadRequest();

            var existItem = await _context.Items.FirstOrDefaultAsync(x => x.Id == id);

            if (existItem == null)
                return NotFound();

            existItem.Title = item.Title;
            existItem.Description = item.Description;
            existItem.Done = item.Done;

            // Implement the changes on the database level
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var existItem = await _context.Items.FirstOrDefaultAsync(x => x.Id == id);

            if (existItem == null)
                return NotFound();

            _context.Items.Remove(existItem);
            await _context.SaveChangesAsync();

            return Ok(existItem);
        }
    }
}
```

<!-- We can test each one of these in postman. -->

然后，我们可以在 Postman 中一个一个地对它们进行测试。

<!-- Finally since we are using .Net 5 when creating webapi project Swagger will be already integrated within our application, in order for us to see the swagger interface we need to go to -->

最后，由于我们在创建 Web API 项目时使用的是 .Net 5，因此 Swagger 已经集成到了我们的应用程序中，要查看 Swagger 界面，可以在浏览器中导航到 <http://localhost:5000/swagger/index.html>。

<!-- Swagger allows you to describe the structure of your APIs so that machines can read them, at no extra work from our side other then defining swagger in older version of .net core swagger will be able to read our API structure and give us a UI that we can use to enhance our dev experience -->

Swagger 允许您描述 API 的结构，以便程序可以自动读取它们，而无需我们额外的工作。Swagger 能够读取 API 结构并为我们生成一个 UI，我们可以借此来改善开发体验。

感谢您阅读本文。

本文是 API 开发系列的第一部分，后面会有第二、第三部分。

<br />

> 作者 ： Mohamad Lawand  
> 译者 ： 技术译民  
> 出品 ： [技术译站](https://ittranslator.cn/)  
> 链接 ： [英文原文](https://dev.to/moe23/asp-net-core-5-rest-api-authentication-with-jwt-step-by-step-140d)
