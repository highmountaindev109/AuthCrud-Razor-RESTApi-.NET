### Details

#### Separate projects for the console app (client) and REST API (server).
* dotnet new console -n ConsoleApp
* dotnet new webapi -n RestApi
#### Solution Structure: Create a solution to organize the projects.
* dotnet new sln -n AuthSolution
* dotnet sln AuthSolution.sln add ConsoleApp/ConsoleApp.csproj
* dotnet sln AuthSolution.sln add RestApi/RestApi.csproj
#### Run Project
* dotnet run --project [Project Name]

#### Create the migration and update the database
* dotnet tool install --global dotnet-ef
* dotnet ef migrations add InitialCreate
if necessary, dotnet ef migrations remove
* dotnet ef database update

### Disable SSL Verification in Postman
* Open Postman.
* Go to File > Settings (or the gear icon in the top-right corner).
* Navigate to the General tab.
* Turn off the option "SSL certificate verification".
* Retry your request.

#### Add packages
dotnet add package [Package Name]

# Frontend

## Add RazorPage
    - dotnet tool uninstall -g dotnet-aspnet-codegenerator
    - dotnet tool install -g dotnet-aspnet-codegenerator
    - dotnet nuget locals all --clear
    - dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
    - dotnet aspnet-codegenerator razorpage PageName --relativeFolderPath Pages --useDefaultLayout net9.0

*Don't have to be running any command on when Creating Page*

### TS file compile
tsc

# Backend

### Role
[Route("api/posts"), Role=(Admin, User)] ? X