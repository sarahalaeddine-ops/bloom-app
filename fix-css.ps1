Set-Content -Path "app\globals.css" -Value @'
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap");
@import "tailwindcss";

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: "DM Sans", sans-serif;
  background: #FAF7F4;
  color: #1A1014;
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
}

.font-serif { font-family: "Cormorant Garamond", serif; }

::-webkit-scrollbar { display: none; }
'@
Write-Host "globals.css fixed!" -ForegroundColor Green
