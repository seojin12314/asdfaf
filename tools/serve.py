# 사주도감 정적 서버. 브라우저가 옛 HTML/JS를 들고 있지 않도록 캐시 금지 헤더를 보낸다.
# 사용: python tools/serve.py [port=3195]   (mvp/saju 를 127.0.0.1 에 서빙)
import http.server, os, sys, functools
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'mvp', 'saju')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3195

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        p = self.path.split('?')[0]
        if p.endswith(('.html', '.js', '.css', '.json')) or p.endswith('/'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache'); self.send_header('Expires', '0')
        else:
            self.send_header('Cache-Control', 'public, max-age=86400')
        super().end_headers()
    def log_message(self, fmt, *args):
        if '.png' in (args[0] if args else '') or '.mp3' in (args[0] if args else ''): return
        super().log_message(fmt, *args)

http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(H, directory=ROOT)) as srv:
    print(f'serving {ROOT} on http://127.0.0.1:{PORT} (no-cache for html/js/css)', flush=True)
    srv.serve_forever()
