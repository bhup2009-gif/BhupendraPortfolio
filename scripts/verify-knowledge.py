"""Verify the reviewed knowledge against the local published portfolio sources."""
import hashlib,json
from html.parser import HTMLParser
from pathlib import Path
root=Path(__file__).resolve().parents[1]
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.skip=0
 def handle_starttag(self,t,a):
  if t in ['script','style']:self.skip+=1
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,s):
  if not self.skip and s.strip():self.parts.append(' '.join(s.split()))
kb=json.loads((root/'concierge/knowledge.json').read_text());docs={}
for name,meta in kb['documents'].items():
 raw=(root/name).read_text();p=Text();p.feed(raw);text=' '.join(p.parts)
 assert hashlib.sha256(text.encode()).hexdigest()==meta['sha256'],f'{name}: portfolio copy changed; review and refresh knowledge.'
 docs[name]=text+' '+raw
for r in kb['records']:
 evidence=' '.join(docs[f] for f in r['sources'])
 for quote in r['evidence']:assert quote in evidence,f'Unsupported evidence in {r["id"]}: {quote}'
print(f'PASS: {len(kb["records"])} reviewed knowledge entries; {len(docs)} source fingerprints and evidence excerpts match.')
