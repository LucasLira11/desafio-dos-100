-- Adiciona a cor de identificação escolhida pelo usuário no cadastro.
-- Nula quando o usuário não escolhe: o app usa o padrão (verde/roxo) nesse caso.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS color TEXT;
