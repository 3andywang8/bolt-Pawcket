
import json
import os
import random
import re

# The source file is now a .ts file
file_path = "/Users/scarlett/program/bolt-Pawcket/app/(tabs)/datas.ts"

# --- Data Generation Helpers ---

def generate_gender():
    return random.choice(['男生', '女生'])

def generate_weight(breed):
    is_cat = '貓' in breed
    if is_cat:
        return f"{random.uniform(2.5, 5.5):.1f}kg"
    else:
        return f"{random.uniform(5.0, 25.0):.1f}kg"

def generate_story(name, breed):
    stories = [
        f"我叫 {name}，是一隻活潑的{breed}，喜歡曬太陽和玩玩具。曾經在街頭流浪，現在在等待一個溫暖的家。我很親人，也很愛撒嬌喔！",
        f"哈囉！我是 {name}。雖然我外表看起來有點害羞，但其實內心是個溫柔的孩子。希望能找到一個有耐心的主人，慢慢引導我，讓我對人類充滿信任。",
        f"大家好，我是{name}！每天都充滿活力，最喜歡的事情就是散步和認識新朋友。如果你在找一個能陪你上山下海的夥伴，那選我准沒錯！",
        f"我的名字是 {name}。我是一隻文靜的{breed}，喜歡靜靜地待在窗邊看風景。我不需要太大的空間，只需要一個愛我的人和一個溫暖的角落。"
    ]
    return random.choice(stories)

def generate_health_status():
    return random.choice([
        ['已絕育', '已施打疫苗', '健康良好'],
        ['未絕育', '已施打疫苗', '待觀察'],
        ['已絕育', '已施打疫苗', '曾有皮膚病']
    ])

def generate_shelter_info(location):
    # Try to extract a name from the address, or default
    match = re.match(r'(^[一-龥]{2,3}[縣市])', location)
    if match:
        shelter_name = f"{match.group(1)}動物之家"
    else:
        shelter_name = "愛心動物收容所"
    
    phone = f"0{random.randint(2, 8)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
    return shelter_name, phone

# --- Main Script ---

if not os.path.exists(file_path):
    print(f"錯誤：找不到檔案 {file_path}")
    exit(1)

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        # Read the content, skipping the 'export default ' part
        ts_content = f.read()
        json_str = ts_content.replace('export default ', '', 1).strip()
        if json_str.endswith(';'):
            json_str = json_str[:-1]
        simplified_data = json.loads(json_str)
except Exception as e:
    print(f"讀取或解析檔案時發生錯誤: {e}")
    exit(1)

enriched_data = []
for item in simplified_data:
    if not isinstance(item, dict):
        continue

    shelter_name, shelter_phone = generate_shelter_info(item.get('location', ''))
    main_image = item.get('image', '')

    new_item = {
        'id': item.get('id'),
        'name': item.get('name'),
        'age': item.get('age'),
        'breed': item.get('breed'),
        'gender': generate_gender(),
        'weight': generate_weight(item.get('breed', '')),
        'location': item.get('location'),
        'story': generate_story(item.get('name'), item.get('breed')),
        'images': [main_image, 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'] if main_image else [],
        'shelterDays': item.get('shelterDays'),
        'personality': item.get('personality'),
        'health': generate_health_status(),
        'shelter': shelter_name,
        'shelterPhone': shelter_phone,
        'adoptionRequirements': [
            '需有固定收入',
            '家人同意飼養',
            '承諾不離不棄',
            '定期健康檢查',
        ],
        'image': main_image, # Keep for compatibility
        'adoptionStatus': item.get('adoptionStatus'),
        'isUrgent': item.get('isUrgent')
    }
    enriched_data.append(new_item)

try:
    with open(file_path, 'w', encoding='utf-8') as f:
        # Write back in the TypeScript export format
        f.write('export default ')
        json.dump(enriched_data, f, indent=4, ensure_ascii=False)
        f.write(';
')
except Exception as e:
    print(f"寫入檔案時發生錯誤: {e}")
    exit(1)

print(f"成功擴充 {file_path} 的資料內容。")
