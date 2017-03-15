using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(FirstLook.Startup))]
namespace FirstLook
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
