import requests
import zlib
import base64
from bs4 import BeautifulSoup

def url_to_text(url):
  """
  Converte un URL in testo usando la decompressione zlib e la decodifica Base64.

  Args:
    url: L'URL da convertire.

  Returns:
    Il testo estratto dall'URL.
  """

  # Recupera il contenuto dell'URL
  response = requests.get(url)
  content = response.content

  # Decodifica il contenuto Base64
  decoded_content = base64.b64decode(content)

  # Decomprime il contenuto zlib
  decompressed_content = zlib.decompress(decoded_content, -zlib.MAX_WBITS)

  # Estrae il testo dal contenuto decompresso
  soup = BeautifulSoup(decompressed_content.decode('utf-8-sig'), 'html.parser')
  text = soup.get_text()

  return text

# Esempio di utilizzo
url = 'https://livetiming.formula1.com/static/2020/2020-07-05_Austrian_Grand_Prix/2020-07-04_Practice_3/Position.z.json'
text = url_to_text(url)

print(text)