import { Context } from 'hono';
import { Env } from './types';
import { BlankInput } from 'hono/types';

export const PageRenderer = (c: Context<Env, '/', BlankInput>, content: any, title?: string, description?: string, canonicalUrl?: string, structuredData?: string) => {
  const pageTitle = title || 'Aperto - Discover Monument Stories';
  const pageDescription = description || 'Turn your smartphone into a personal tour guide with AI-powered monument recognition. Discover fascinating stories behind every monument.';
  const baseUrl = 'https://aperto-app.com';
  const canonical = canonicalUrl || baseUrl;
  const ogImageUrl = `${baseUrl}/og-image.png`;

  return c.html(
    `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>${pageTitle}</title>
		<meta name="description" content="${pageDescription}" />
		<link rel="canonical" href="${canonical}" />

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website" />
		<meta property="og:url" content="${canonical}" />
		<meta property="og:title" content="${pageTitle}" />
		<meta property="og:description" content="${pageDescription}" />
		<meta property="og:image" content="${ogImageUrl}" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />

		<!-- Twitter -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:url" content="${canonical}" />
		<meta name="twitter:title" content="${pageTitle}" />
		<meta name="twitter:description" content="${pageDescription}" />
		<meta name="twitter:image" content="${ogImageUrl}" />

		<!-- Favicon -->
		<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
		<link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
		<link rel="apple-touch-icon" href="/icon.png" />

		<!-- Preconnect for performance -->
		<link rel="preconnect" href="https://unpkg.com" crossorigin />
		<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
		<link rel="dns-prefetch" href="https://unpkg.com" />
		<link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

		<!-- Scripts -->
		<script src="https://unpkg.com/htmx.org@1.9.12" integrity="sha384-ujb1lZYygJmzgSwoxRggbCHcjc0rB2XoQrxeTUQyRjrOnlCoYta87iKBWq3EsdM2" crossorigin="anonymous"></script>
		<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
		${structuredData ? `\n\t\t<!-- Structured Data -->\n\t\t<script type="application/ld+json">${structuredData}</script>` : ''}
		
		<style>
		  html {
		    scroll-behavior: smooth;
		  }
		  
		  @keyframes fadeInUp {
		    from {
		      opacity: 0;
		      transform: translateY(30px);
		    }
		    to {
		      opacity: 1;
		      transform: translateY(0);
		    }
		  }
		  
		  .animate-fade-in-up {
		    animation: fadeInUp 0.6s ease-out forwards;
		  }
		  
		  .animate-delay-100 {
		    animation-delay: 0.1s;
		  }
		  
		  .animate-delay-200 {
		    animation-delay: 0.2s;
		  }
		  
		  .animate-delay-300 {
		    animation-delay: 0.3s;
		  }
		</style>
	</head>
	<body class="antialiased">
		${content}
		
		<script>
		  // Smooth scrolling for anchor links
		  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		    anchor.addEventListener('click', function (e) {
		      e.preventDefault();
		      const target = document.querySelector(this.getAttribute('href'));
		      if (target) {
		        target.scrollIntoView({
		          behavior: 'smooth',
		          block: 'start'
		        });
		      }
		    });
		  });
		</script>
	</body>
</html>
`,
  );
};