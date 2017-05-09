using System;
using System.Drawing;
using System.IO;
using ImageProcessor;


namespace ImageHandler
{
    public class Manage
    {
        /// <summary>
        /// Install ImageProcessor nuget package to use + add Drawing reference!!!
        /// </summary>
        /// <param name="photoBytes">Teljes fénykép</param>
        /// <param name="heightInPixel">Kicsinyített kép magassága(default érték:480)</param>
        /// <param name="quality">Minőség(default érték:60)</param>
        /// <returns></returns>
        public byte[] GetSmallImage(byte[] photoBytes, int heightInPixel = 480, int quality = 60)
        {
            byte[] smallByteImage = new byte[0];
            ImageProcessor.Imaging.Formats.ISupportedImageFormat format = new ImageProcessor.Imaging.Formats.JpegFormat() { Quality = quality };
            try
            {
                using (MemoryStream outStream = new MemoryStream())
                {
                    using (ImageFactory imageFactory = new ImageFactory(preserveExifData: true))
                    {
                        imageFactory.Load(photoBytes)
                            .Resize(new Size(0, heightInPixel))
                            .Format(format)
                            .Save(outStream);
                    }
                    smallByteImage = outStream.ToArray();
                }
            }
            catch (Exception)
            {
            }

            return smallByteImage;
        }
    }
}
