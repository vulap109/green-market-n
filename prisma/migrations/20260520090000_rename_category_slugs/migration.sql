DO $$
DECLARE
  old_slug TEXT;
  new_slug TEXT;
BEGIN
  FOR old_slug, new_slug IN
    SELECT *
    FROM (
      VALUES
        ('fruit-basket', 'gio-trai-cay'),
        ('imported-fruits', 'trai-cay-nhap-khau'),
        ('flowers', 'hoa-tuoi'),
        ('cream-cake', 'banh-kem'),
        ('fresh', 'gio-trai-cay-tuoi'),
        ('box', 'hop-qua-trai-cay'),
        ('funeral', 'gio-trai-cay-vieng')
    ) AS slug_map(old_slug, new_slug)
  LOOP
    IF EXISTS (SELECT 1 FROM "category" WHERE "slug" = old_slug)
      AND EXISTS (SELECT 1 FROM "category" WHERE "slug" = new_slug) THEN
      RAISE EXCEPTION 'Cannot rename category slug from % to % because both slugs exist.',
        old_slug,
        new_slug;
    END IF;
  END LOOP;

  FOR old_slug, new_slug IN
    SELECT *
    FROM (
      VALUES
        ('fruit-basket', 'gio-trai-cay'),
        ('imported-fruits', 'trai-cay-nhap-khau'),
        ('flowers', 'hoa-tuoi'),
        ('cream-cake', 'banh-kem'),
        ('fresh', 'gio-trai-cay-tuoi'),
        ('box', 'hop-qua-trai-cay'),
        ('funeral', 'gio-trai-cay-vieng')
    ) AS slug_map(old_slug, new_slug)
  LOOP
    UPDATE "category"
    SET "slug" = new_slug,
        "updated_at" = NOW()
    WHERE "slug" = old_slug;
  END LOOP;
END $$;
