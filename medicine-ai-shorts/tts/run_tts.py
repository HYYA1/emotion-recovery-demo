"""Run the library's edge-tts tool with this machine's CA bundle (the network proxy re-signs TLS).
python run_tts.py <LIB>/core/tts/tts_zh.py lines.json out_dir [args…]"""
import os, ssl, sys, runpy
import edge_tts.communicate as C
ca = os.environ.get('LEMO_CA', '/root/.ccr/ca-bundle.crt')
if os.path.exists(ca): C._SSL_CTX = ssl.create_default_context(cafile=ca)
sys.argv = sys.argv[1:]
runpy.run_path(sys.argv[0], run_name='__main__')
