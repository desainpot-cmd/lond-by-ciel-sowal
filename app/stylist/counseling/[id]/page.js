"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";

const LABELS = {
  hair_length: { short: "ショート", medium: "ミディアム", long: "ロング", very_long: "超ロング" },
  hair_type: { straight: "直毛", wavy: "くせ毛", curly: "強いくせ" },
  hair_thickness: { fine: "細い", medium: "普通", thick: "太い" },
  hair_volume: { few: "少ない", medium: "普通", many: "多い" },
  gender: { female: "女性", male: "男性", other: "その他/回答しない" },
  period: { within_3m: "3ヶ月以内", "3_6m": "半年以内", "6_12m": "1年以内", over_1y: "1年以上前" },
};

const INTEREST_LABEL = {
  shampoo: "シャンプー",
  treatment: "トリートメント",
  scalp: "頭皮ケア",
  styling: "スタイリング剤",
  oil: "ヘアオイル”,
  coloring: "カラー後のケア",
};

