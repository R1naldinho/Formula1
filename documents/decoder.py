import requests
import zlib
import base64
from bs4 import BeautifulSoup

def fetch_data(url):
  response = requests.get(url)
  content = response.content.decode('utf-8')
  return content

def array_to_text(content):

  decoded_content = base64.b64decode(content)

  decompressed_content = zlib.decompress(decoded_content, -zlib.MAX_WBITS)

  soup = BeautifulSoup(decompressed_content.decode('utf-8-sig'), 'html.parser')
  text = soup.get_text()

  return text

def parse_data(input_data):
  result = []
  lines = input_data.split('\n')
  

  for line in lines:
    if not line:
      continue
  
    time = line[:12]
    data_string = line[13:-1]
    result.append({"time": time, "data": data_string})
  print(result[0]["data"], result[0]["time"])
  return result


url = 'https://livetiming.formula1.com/static/2020/2020-07-05_Austrian_Grand_Prix/2020-07-04_Practice_3/Position.z.jsonStream'

parsed_data = parse_data(fetch_data(url))


text = []
for entry in parsed_data:
  text.append(array_to_text(entry["data"])) 

print(text)