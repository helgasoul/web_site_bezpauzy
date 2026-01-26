-- Добавление изображения для нутрициолога Климкова Марина

UPDATE menohub_experts
SET
  image = '/marina-klimkova.jpg',
  updated_at = NOW()
WHERE category = 'nutritionist';
