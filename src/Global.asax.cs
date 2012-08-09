using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Web.Routing;
using SimpleBoard.Domain;
using SimpleBoard.Utils;

namespace SimpleBoard
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);

            var messageStore = new MessageStore("StoryBoard");
            var messages = messageStore.GetAll();
            if (!messages.Any())
            {
                var initialMessagesFile = EmbeddedResource.Get("InitialMessages.json");
                var initialMessages = initialMessagesFile.Split(new[] {Environment.NewLine}, StringSplitOptions.RemoveEmptyEntries).ToList();
                initialMessages.ForEach(messageStore.Add);
            }

//            if (bool.Parse(ConfigurationManager.AppSettings["AppHarbor"]))
//            {
//                var config = WebConfigurationManager.OpenWebConfiguration("~");
//                var authorization = (AuthenticationSection) config.GetSection("system.web/authorization");
//                authorization.Mode = AuthenticationMode.None;
//                config.Save();
//            }
        }
    }
}