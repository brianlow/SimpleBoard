using System;
using System.IO;
using System.Reflection;

namespace SimpleBoard.Utils
{
    public static class EmbeddedResource
    {
        public static string Get(string name)
        {
            var assembly = Assembly.GetAssembly(typeof (EmbeddedResource));
            foreach (string resourceName in assembly.GetManifestResourceNames())
            {
                if (resourceName.ToLower().EndsWith(name.ToLower()))
                {
                    using (var reader = new StreamReader(assembly.GetManifestResourceStream(resourceName)))
                    {
                        return reader.ReadToEnd();
                    }
                }
            }
            throw new ApplicationException("Cannot find resource " + name + " in " + assembly.GetName().Name);
        }
    }
}