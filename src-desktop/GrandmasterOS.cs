using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace GrandmasterOS
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(appDir);

            int port = 5173;
            string portFilePath = Path.Combine(appDir, "desktop.port");
            if (File.Exists(portFilePath))
            {
                int savedPort;
                if (int.TryParse(File.ReadAllText(portFilePath).Trim(), out savedPort))
                {
                    if (savedPort > 0 && savedPort < 65535) port = savedPort;
                }
            }

            bool serverReady = IsServerResponsive(port);

            if (!serverReady)
            {
                string nodePath = FindNodeExe();
                if (string.IsNullOrEmpty(nodePath))
                {
                    MessageBox.Show(
                        "Node.js runtime was not found on this machine.\n\nGrandmaster OS operates completely offline and requires Node.js installed locally.\nPlease install Node.js from https://nodejs.org or ensure node.exe is in your system PATH.",
                        "Grandmaster OS - Dependency Required",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                    return;
                }

                string serverScript = Path.Combine(appDir, "scripts", "desktop-server.js");
                if (!File.Exists(serverScript))
                {
                    MessageBox.Show(
                        "Cannot find server script: " + serverScript,
                        "Grandmaster OS Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                ProcessStartInfo serverPsi = new ProcessStartInfo
                {
                    FileName = nodePath,
                    Arguments = "\"" + serverScript + "\" --no-browser",
                    WorkingDirectory = appDir,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true,
                    UseShellExecute = true
                };

                try
                {
                    Process.Start(serverPsi);
                }
                catch (Exception ex)
                {
                    MessageBox.Show(
                        "Failed to start desktop supervisor:\n\n" + ex.Message,
                        "Grandmaster OS Launch Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                // Poll until server is ready (up to 8 seconds)
                for (int i = 0; i < 40; i++)
                {
                    Thread.Sleep(200);

                    if (File.Exists(portFilePath))
                    {
                        int p;
                        if (int.TryParse(File.ReadAllText(portFilePath).Trim(), out p))
                        {
                            if (p > 0) port = p;
                        }
                    }

                    if (IsServerResponsive(port))
                    {
                        serverReady = true;
                        break;
                    }
                }

                if (!serverReady)
                {
                    MessageBox.Show(
                        "Grandmaster OS offline server failed to respond in time.\nPlease check desktop.log for diagnostic information.",
                        "Grandmaster OS Startup Timeout",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }
            }

            // Launch desktop window
            LaunchDesktopWindow("http://127.0.0.1:" + port);
        }

        static bool IsServerResponsive(int port)
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + port + "/");
                request.Method = "GET";
                request.Timeout = 600;
                request.ReadWriteTimeout = 600;

                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        static string FindNodeExe()
        {
            string[] explicitPaths = new string[]
            {
                @"C:\Program Files\nodejs\node.exe",
                @"C:\Program Files (x86)\nodejs\node.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\node\node.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), @"npm\node.exe")
            };

            foreach (string p in explicitPaths)
            {
                if (File.Exists(p)) return p;
            }

            string pathEnv = Environment.GetEnvironmentVariable("PATH") ?? "";
            string[] dirs = pathEnv.Split(';');
            foreach (string dir in dirs)
            {
                string cleanDir = dir.Trim();
                if (!string.IsNullOrEmpty(cleanDir))
                {
                    try
                    {
                        string candidate = Path.Combine(cleanDir, "node.exe");
                        if (File.Exists(candidate)) return candidate;
                    }
                    catch {}
                }
            }

            return null;
        }

        static void LaunchDesktopWindow(string url)
        {
            string[] browserCandidates = new string[]
            {
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
            };

            string browserPath = null;
            foreach (string b in browserCandidates)
            {
                if (File.Exists(b))
                {
                    browserPath = b;
                    break;
                }
            }

            string profileDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "GrandmasterOS",
                "Profile"
            );

            if (!string.IsNullOrEmpty(browserPath))
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = browserPath,
                    Arguments = "--app=" + url + " --user-data-dir=\"" + profileDir + "\" --window-size=1400,900 --window-position=center",
                    UseShellExecute = true
                };

                try
                {
                    Process.Start(psi);
                    return;
                }
                catch {}
            }

            // Fallback: Default browser
            try
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Unable to launch browser window:\n" + ex.Message,
                    "Grandmaster OS",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}
