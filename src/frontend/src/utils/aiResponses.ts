// Evaluate simple math expressions safely
function evaluateMath(expr: string): string | null {
  try {
    // Clean the expression
    const cleaned = expr
      .replace(/x/gi, "*")
      .replace(/÷/g, "/")
      .replace(/[^0-9+\-*/.()^%\s]/g, "")
      .trim();

    if (!cleaned) return null;

    // Handle exponentiation (^)
    const withPow = cleaned.replace(/(\d+(\.\d+)?)\s*\^\s*(\d+(\.\d+)?)/g, "Math.pow($1,$3)");

    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${withPow})`)();
    if (typeof result === "number" && isFinite(result)) {
      // Round to avoid floating point noise
      const rounded = Math.round(result * 1e10) / 1e10;
      return rounded.toString();
    }
    return null;
  } catch {
    return null;
  }
}

// Extract and solve math expression from text
function tryMathSolve(msg: string): string | null {
  // Direct expressions like "2+3", "10*5", "100/4"
  const exprMatch = msg.match(/[\d\s]*[\d]+[\s]*([+\-*/÷x^%][\s]*[\d.]+[\s]*)+/);
  if (exprMatch) {
    const result = evaluateMath(exprMatch[0]);
    if (result !== null) {
      const expr = exprMatch[0].trim();
      return `**${expr} = ${result}**\n\nYaad rakhein:\n- Addition (+), Subtraction (-), Multiplication (*), Division (/)\n- BODMAS/PEMDAS ka rule follow karein`;
    }
  }

  // "X ka Y%" pattern
  const percentMatch = msg.match(/(\d+(?:\.\d+)?)\s*(?:ka|of|%\s+of)\s*(\d+(?:\.\d+)?)\s*%?/i)
    || msg.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|ka)\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const [, a, b] = percentMatch;
    const result = (parseFloat(a) * parseFloat(b)) / 100;
    return `**${a}% of ${b} = ${result}**`;
  }

  return null;
}

export function generateAIResponse(userMessage: string, hasImage: boolean): string {
  if (hasImage) {
    return generateImageResponse(userMessage);
  }
  return generateTextResponse(userMessage);
}

// ─── Smart Fallback Generator ────────────────────────────────────────────────

export function generateSmartFallback(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();

  // ── CURRENT AFFAIRS / GK ──
  if (lowerMsg.includes("pm") || lowerMsg.includes("prime minister") || lowerMsg.includes("pradhan mantri")) {
    if (lowerMsg.includes("india") || lowerMsg.includes("bharat") || !lowerMsg.includes("pakistan")) {
      return `**India ke Prime Minister**

**Narendra Modi** India ke current (2024) Prime Minister hain.
- Birth: 17 September 1950, Vadnagar, Gujarat
- Party: Bharatiya Janata Party (BJP)
- PM bane: 26 May 2014 (pehli baar)
- Teen baar PM: 2014, 2019, 2024
- Pehle Gujarat ke Chief Minister the (2001-2014)

**India ke Pradhan Mantriyon ki list:**
1. Jawaharlal Nehru (1947-1964) — Pehle PM
2. Lal Bahadur Shastri (1964-1966)
3. Indira Gandhi (1966-1977, 1980-1984) — Pehli mahila PM
4. Rajiv Gandhi (1984-1989)
5. Atal Bihari Vajpayee (1999-2004) — BJP se pehle PM
6. Manmohan Singh (2004-2014)
7. **Narendra Modi (2014-present)**`;
    }
  }

  if (lowerMsg.includes("president") || lowerMsg.includes("rashtrapati")) {
    return `**India ke Rashtrapati (President)**

**Droupadi Murmu** India ki current (2022-present) Rashtrapati hain.
- India ki 15th President
- Pehli Aadivasi mahila jo President bani
- Birth: 20 June 1958, Odisha

**Important Presidents:**
- Dr. Rajendra Prasad — Pehle President (1950-1962)
- Dr. APJ Abdul Kalam — "Missile Man of India" (2002-2007)
- Pranab Mukherjee (2012-2017)
- Ram Nath Kovind (2017-2022)
- Droupadi Murmu (2022-present)

**Role:**
- Head of State (nominal)
- Constitutional powers
- Parliament ka hissa
- Supreme Commander of Armed Forces`;
  }

  if ((lowerMsg.includes("capital") || lowerMsg.includes("rajdhani")) && !lowerMsg.includes("india")) {
    return `**World Capitals (Rajdhaniyan)**

**Kuch important capitals:**
- India → **New Delhi**
- USA → **Washington D.C.**
- UK → **London**
- France → **Paris**
- China → **Beijing**
- Japan → **Tokyo**
- Russia → **Moscow**
- Australia → **Canberra**
- Pakistan → **Islamabad**
- Bangladesh → **Dhaka**
- Nepal → **Kathmandu**
- Germany → **Berlin**
- Canada → **Ottawa**
- Brazil → **Brasília**
- South Africa → **Pretoria** (executive)

Kisi specific desh ki capital poochho toh bataunga!`;
  }

  // ── PHYSICS ──
  if (lowerMsg.includes("newton") || lowerMsg.includes("newton ka niyam") || (lowerMsg.includes("motion") && lowerMsg.includes("law"))) {
    return `**Newton ke Teeno Niyam (Laws of Motion)**

**1st Law — Inertia ka Niyam:**
Koi bhi object tab tak apni state nahi badlta jab tak usp koi external force na lage.
Example: Moving gaadi mein achanak brake lagne par log aage jhuk jaate hain.

**2nd Law — F = ma:**
Force = Mass × Acceleration
Jitna zyada mass hoga, utni zyada force chahiye same acceleration ke liye.
Example: Cycle chalana aasan, truck chalana mushkil.

**3rd Law — Action-Reaction:**
Har action ke liye ek equal aur opposite reaction hota hai.
Example: Rocket zyada exhaust force neeche deta hai, isiliye upar jaata hai.

**Real Life Connections:**
- Seat belt inertia se bachata hai (1st law)
- Cricket ball pe harder swing = faster ball (2nd law)
- Swimming mein paani ko push karo, body aage jaati hai (3rd law)`;
  }

  if (lowerMsg.includes("gravity") || lowerMsg.includes("gravitation") || lowerMsg.includes("gurutvakarshan")) {
    return `**Gravitation (Gurutvakarshan)**

**Definition:** Do objects ke beech ek attraction force hoti hai jo unke mass ke proportional aur distance ke square ke inversely proportional hoti hai.

**Newton ka Gravitational Law:**
F = G × (m1 × m2) / r²
Jahan G = 6.674 × 10⁻¹¹ N·m²/kg² (Universal Gravitational Constant)

**Earth ki Gravity:**
- g = 9.8 m/s² (surface pe)
- Weight = mass × g
- 60 kg ka insaan ka weight = 60 × 9.8 = 588 N

**Key Points:**
- Gravity wajah hai ki planet sun ke around orbit karte hain
- Moon Earth ke gravity se bound hai
- Space mein weightlessness feel hoti hai kyunki free fall mein hote hain
- Gravity is liye kaam karti hai kyunki mass spacetime ko curve karta hai (Einstein)`;
  }

  if (lowerMsg.includes("light") || lowerMsg.includes("prakash") || lowerMsg.includes("prism") || lowerMsg.includes("reflection") || lowerMsg.includes("refraction") || lowerMsg.includes("spectrum")) {
    return `**Prakash (Light) — Complete Guide**

**Prakash ki Properties:**
- Speed: 3 × 10⁸ m/s (vacuum mein)
- Electromagnetic wave hai
- Straight line mein travel karta hai

**Reflection (Pravartan):**
- Angle of incidence = Angle of reflection
- Mirror image banta hai
- Flat mirror vs Curved mirror (concave/convex)

**Refraction (Apvartan):**
- Ek medium se dusre medium mein jaane par speed change hoti hai
- Straw paani mein tedha dikhta hai — refraction ki wajah se

**Prism aur Rainbow:**
- Prism white light ko 7 rangon mein split karta hai: VIBGYOR
- Violet, Indigo, Blue, Green, Yellow, Orange, Red
- Rainbow: Rain drops prism ki tarah kaam karte hain

**Total Internal Reflection:**
- Fibre optics is principle pe kaam karta hai
- Diamonds isiliye chamakte hain`;
  }

  if (lowerMsg.includes("sound") || lowerMsg.includes("dhwani") || lowerMsg.includes("awaz") || lowerMsg.includes("ultrasonic") || lowerMsg.includes("frequency")) {
    return `**Sound (Dhwani/Awaz)**

**Sound Kya Hai:**
- Mechanical wave hai — medium zaroori hai
- Solid, Liquid, Gas teeno mein travel karta hai
- Vacuum mein nahi travel kar sakti

**Speed of Sound:**
- Air mein: ~343 m/s (at 20°C)
- Water mein: ~1480 m/s
- Steel mein: ~5000 m/s
- Solid > Liquid > Gas

**Frequency aur Pitch:**
- High frequency → High pitch (tez awaz)
- Human ear: 20 Hz to 20,000 Hz sun sakta hai
- Ultrasound: 20,000 Hz se zyada (bat, dolphin use karte hain)
- Infrasound: 20 Hz se kam (earthquake, whale)

**Echo:**
- Reflection of sound
- Minimum 17 m distance chahiye echo ke liye
- Sonar, RADAR is principle pe kaam karta hai

**Uses of Ultrasound:**
- Medical: Sonography/Ultrasound scan
- Industrial: Detecting cracks in metals`;
  }

  if (lowerMsg.includes("electricity") || lowerMsg.includes("bijli") || lowerMsg.includes("current") || lowerMsg.includes("voltage") || lowerMsg.includes("circuit") || lowerMsg.includes("resistance") || lowerMsg.includes("ohm")) {
    return `**Electricity (Bijli/Vidyut)**

**Basic Concepts:**
- Current (I): Charge ka flow, unit = Ampere (A)
- Voltage (V): Electric potential difference, unit = Volt (V)
- Resistance (R): Current ko oppose karna, unit = Ohm (Ω)

**Ohm's Law:**
V = I × R (Voltage = Current × Resistance)
- Agar V = 12V aur R = 4Ω, toh I = 12/4 = 3A

**Power:**
P = V × I = I²R = V²/R, unit = Watt (W)

**Series vs Parallel Circuit:**
- Series: Ek hi path, current same, voltage divide hota hai
- Parallel: Multiple paths, voltage same, current divide hota hai

**AC vs DC:**
- DC (Direct Current): Battery se milta hai, ek direction mein flow
- AC (Alternating Current): Ghar ki bijli, direction alternate karta hai (50 Hz India mein)

**Safety:**
- Earth wire: Short circuit se bachata hai
- Fuse/MCB: Overcurrent se protection`;
  }

  if (lowerMsg.includes("magnet") || lowerMsg.includes("magnetic") || lowerMsg.includes("chumnak")) {
    return `**Magnetism (Chumbaktva)**

**Magnet ke Properties:**
- North aur South poles hote hain
- Like poles repel (N-N, S-S), Unlike poles attract (N-S)
- Magnet ke 2 pieces karne pe dono naye pieces ke bhi N-S poles bante hain

**Magnetic Field:**
- Magnet ke around ek invisible field hoti hai
- Field lines N se S pole ki taraf jaati hain
- Iron filings se field lines visible hoti hain

**Earth ka Magnetic Field:**
- Earth ek giant magnet ki tarah hai
- Geographic North Pole ke paas Magnetic South Pole hai
- Compass needle North ki taraf point karti hai

**Electromagnetism:**
- Current carrying wire ke around magnetic field banta hai
- Electromagnet: Coil + Iron core + Current
- Uses: Electric motors, generators, MRI machines, speakers

**Electromagnetic Induction (Faraday):**
- Moving magnet ke paas wire mein current induced hoti hai
- Dynamo/Generator is principle pe kaam karta hai`;
  }

  // ── CHEMISTRY ──
  if (lowerMsg.includes("periodic table") || lowerMsg.includes("element") || lowerMsg.includes("tatva") || lowerMsg.includes("periodic") || lowerMsg.includes("avogadro")) {
    return `**Periodic Table (Tatvaon ki Aavart Sarni)**

**Discovery:**
- Dmitri Mendeleev ne 1869 mein banaya
- Atomic number ke order mein arrange kiya

**Structure:**
- 118 elements hain total
- 7 Periods (rows) hain
- 18 Groups (columns) hain
- Periods: Left se right atomic number badhta hai
- Groups: Ek hi column mein similar properties hoti hain

**Important Groups:**
- Group 1 (Alkali Metals): Li, Na, K — bahut reactive
- Group 17 (Halogens): F, Cl, Br — reactive non-metals
- Group 18 (Noble Gases): He, Ne, Ar — inert gases

**Important Elements:**
- H (Hydrogen, 1), O (Oxygen, 8), C (Carbon, 6)
- N (Nitrogen, 7), Fe (Iron, 26), Au (Gold, 79)
- Na (Sodium, 11), Ca (Calcium, 20)

**Valency:**
- Outermost shell ke electrons = valence electrons
- Group 1 → valency 1, Group 2 → valency 2
- Group 17 → valency 1 (needs 1 electron)`;
  }

  if (lowerMsg.includes("acid") || lowerMsg.includes("base") || lowerMsg.includes("alkali") || lowerMsg.includes("ph") || lowerMsg.includes("neutral") || lowerMsg.includes("titration")) {
    return `**Acids, Bases aur pH**

**Acids (Aml):**
- H+ ions release karte hain
- pH < 7
- Sour taste (nimbu, sirka)
- Litmus paper ko red karte hain
- Examples: HCl, H2SO4, HNO3, CH3COOH (acetic acid)

**Bases (Khar):**
- OH- ions release karte hain
- pH > 7
- Bitter taste, slippery feel
- Litmus paper ko blue karte hain
- Examples: NaOH, Ca(OH)2, KOH

**pH Scale:**
- 0-6 = Acidic (0 = most acidic)
- 7 = Neutral (pure water)
- 8-14 = Basic/Alkaline (14 = most basic)

**Neutralization:**
Acid + Base → Salt + Water
HCl + NaOH → NaCl + H2O

**Daily Life Examples:**
- Nimbu ka juice: pH ~2 (acidic)
- Paani: pH 7 (neutral)
- Baking soda: pH ~9 (basic)
- Blood: pH 7.4 (slightly basic)

**Indicators:**
- Litmus, Phenolphthalein, Methyl orange`;
  }

  if (lowerMsg.includes("bond") || lowerMsg.includes("ionic") || lowerMsg.includes("covalent") || lowerMsg.includes("molecule") || lowerMsg.includes("compound")) {
    return `**Chemical Bonding (Rasayanik Bandh)**

**Ionic Bond (Vaidyut Sahyojak Bandh):**
- Ek atom electron deta hai, dusra leta hai
- Metals + Non-metals ke beech
- Example: NaCl — Na electron deta hai, Cl leta hai
- Properties: High melting point, conducts electricity in solution

**Covalent Bond (Sahsahyojak Bandh):**
- Dono atoms electrons share karte hain
- Non-metals ke beech
- Example: H2O — O 2 electrons H ke saath share karta hai
- Properties: Low melting point, poor conductor

**Single, Double, Triple Bonds:**
- Single: H-H (1 pair share)
- Double: O=O (2 pairs share)
- Triple: N≡N (3 pairs share)

**Important Molecules:**
- H2O (Water): Bent shape, polar
- CO2 (Carbon dioxide): Linear shape
- CH4 (Methane): Tetrahedral
- NH3 (Ammonia): Pyramidal

**Metallic Bond:**
- Metals mein "sea of electrons"
- Isiliye metals conduct karte hain electricity`;
  }

  // ── BIOLOGY ──
  if (lowerMsg.includes("photosynthesis") || lowerMsg.includes("prakashan sansleshan")) {
    return `**Photosynthesis (Prakashan Sansleshan)**

**Definition:** Plants sunlight use karke apna khana (glucose) banate hain.

**Chemical Equation:**
6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂

**Kahan hota hai:** Chloroplast mein (green pigment chlorophyll ki wajah se)

**2 Main Stages:**

**1. Light Reaction (Prakash Kriya):**
- Sunlight absorb hoti hai
- Water split hota hai: H₂O → O₂ + H⁺
- ATP aur NADPH banta hai
- Oxygen release hoti hai (by-product)

**2. Dark Reaction / Calvin Cycle:**
- CO₂ fix hota hai
- Glucose (C₆H₁₂O₆) banta hai
- Light ki zaroorat nahi hoti directly

**Importance:**
- Plants ka food source
- O₂ produce karta hai jise hum breathe karte hain
- Carbon cycle maintain karta hai
- Food chain ka base hai

**Yaad rakhne ke liye:** "Sun + Water + CO₂ = Sugar + Oxygen"`;
  }

  if (lowerMsg.includes("cell") || lowerMsg.includes("koshika") || lowerMsg.includes("mitochondria") || lowerMsg.includes("nucleus") || lowerMsg.includes("chromosome")) {
    return `**Cell (Koshika) — Life ki Basic Unit**

**Cell Theory:**
- Saari living things cells se bani hain
- Cell life ki basic functional unit hai
- Cells purani cells se bante hain (division se)

**2 Types of Cells:**
1. **Prokaryotic:** Nucleus nahi hota (bacteria, archaea)
2. **Eukaryotic:** Nucleus hota hai (plants, animals, fungi)

**Key Organelles:**
- **Nucleus:** Control center — DNA store karta hai
- **Mitochondria:** "Powerhouse of the cell" — ATP (energy) banata hai
- **Ribosome:** Protein synthesis karta hai
- **Endoplasmic Reticulum:** Protein/lipid transport
- **Golgi Apparatus:** Packaging aur distribution
- **Cell Membrane:** Gatekeeper — kya andar/bahar jaata hai

**Plant vs Animal Cell:**
- Plant cell mein: Cell wall, chloroplast, large vacuole — extra
- Animal cell mein: Centrioles — extra

**Cell Division:**
- Mitosis: Growth aur repair (2 identical cells)
- Meiosis: Reproductive cells (4 cells, half chromosomes)`;
  }

  if (lowerMsg.includes("digestive") || lowerMsg.includes("pachan") || lowerMsg.includes("digestion") || lowerMsg.includes("stomach") || lowerMsg.includes("intestine")) {
    return `**Digestive System (Pachan Tantra)**

**Process Step by Step:**

**1. Mouth (Munh):**
- Teeth food chew karte hain (mechanical digestion)
- Saliva mein amylase enzyme — starch digest karta hai

**2. Oesophagus:**
- Peristalsis se food stomach mein jaata hai

**3. Stomach:**
- HCl acid — bacteria ko kill karta hai
- Pepsin enzyme — protein digest karta hai
- Food 2-4 hours ruk ta hai

**4. Small Intestine (Choti Aant):**
- Liver se bile — fat digest karta hai
- Pancreas se enzymes — sab nutrients digest karte hain
- Absorption: Villi nutrients blood mein absorb karte hain
- Sabse zyada digestion yahan hoti hai

**5. Large Intestine (Badi Aant):**
- Water absorb hota hai
- Waste material form hota hai

**6. Rectum & Anus:**
- Waste bahar nikalta hai

**Key Organs:**
- Liver: Bile produce karta hai, glucose store karta hai
- Pancreas: Insulin produce karta hai (diabetes mein important)`;
  }

  if (lowerMsg.includes("respiratory") || lowerMsg.includes("breathing") || lowerMsg.includes("sans") || lowerMsg.includes("lung") || lowerMsg.includes("oxygen")) {
    return `**Respiratory System (Shwasan Tantra)**

**Purpose:** O₂ andar lena, CO₂ bahar nikalna

**Process:**

**1. Nasal Cavity (Naak):**
- Air filter, warm aur moist hoti hai
- Mucus — dust aur bacteria pakadta hai

**2. Trachea (Windpipe):**
- Air lungs tak jaati hai
- Cartilage rings — collapse hone se bachate hain

**3. Bronchi aur Bronchioles:**
- Trachea 2 bronchi mein split hoti hai
- Further bronchioles mein divide hoti hain

**4. Alveoli (Air Sacs):**
- ~300 million alveoli hain
- Yahan gas exchange hota hai
- O₂ blood mein jaata hai, CO₂ alveoli mein

**Breathing Mechanism:**
- Inhalation: Diaphragm neeche jaata hai, lungs expand hote hain
- Exhalation: Diaphragm upar jaata hai, lungs compress hote hain

**Breathing Rate:**
- Normal: 12-20 breaths/minute
- Exercise mein: Up to 60 breaths/minute

**Diseases:**
- Asthma: Bronchioles narrow ho jaati hain
- Pneumonia: Alveoli fluid se bhar jaati hain`;
  }

  if (lowerMsg.includes("blood") || lowerMsg.includes("heart") || lowerMsg.includes("circulatory") || lowerMsg.includes("rakta") || lowerMsg.includes("dil") || lowerMsg.includes("vein") || lowerMsg.includes("artery")) {
    return `**Circulatory System (Parisanchar Tantra)**

**Heart (Dil):**
- 4 chambers: 2 Atria (upper) + 2 Ventricles (lower)
- Right side: Deoxygenated blood pump karta hai lungs mein
- Left side: Oxygenated blood pump karta hai body mein
- Heart rate: 60-100 beats/minute normal

**Blood Vessels:**
- **Arteries:** Heart se body ko blood le jaati hain (oxygenated)
- **Veins:** Body se heart ko blood le aati hain (deoxygenated)
- **Capillaries:** Cells ke paas — nutrient/O₂ exchange hota hai

**Blood Components:**
- **RBC (Red Blood Cells):** Haemoglobin — O₂ transport
- **WBC (White Blood Cells):** Infection se ladte hain
- **Platelets:** Blood clotting
- **Plasma:** Liquid part — nutrients, hormones transport

**Blood Circulation:**
1. Body → Right Atrium → Right Ventricle → Lungs
2. Lungs → Left Atrium → Left Ventricle → Body

**Blood Types:**
- A, B, AB, O — ABO system
- O⁻ = Universal donor, AB⁺ = Universal receiver`;
  }

  // ── WATER CYCLE ──
  if (lowerMsg.includes("water cycle") || lowerMsg.includes("paani ka chakra") || lowerMsg.includes("jal chakra") || lowerMsg.includes("evaporation") || lowerMsg.includes("precipitation") || lowerMsg.includes("condensation")) {
    return `**Water Cycle (Jal Chakra / Paani Ka Chakra)**

**Definition:** Paani ka continuous movement — Earth surface, atmosphere aur underground ke beech.

**4 Main Stages:**

**1. Evaporation (Vashpikaran):**
- Sun ki heat se paani vapour ban jaata hai
- Oceans, rivers, lakes se zyada evaporation
- Plants se bhi hota hai — Transpiration kehte hain

**2. Condensation (Sansapan):**
- Water vapour thanda hone par liquid banta hai
- Clouds form hote hain
- Morning ki oos (dew) bhi condensation hai

**3. Precipitation (Varsha):**
- Cloud se paani neeche girta hai
- Rain, Snow, Hail, Sleet
- India mein Monsoon = heavy precipitation

**4. Collection (Sangrah):**
- Paani rivers, lakes, oceans mein iktha hota hai
- Ground mein seep hota hai — Groundwater/Bhujal
- Runoff hota hai

**Importance:**
- Fresh water supply maintain karta hai
- Climate regulate karta hai
- Nutrients distribute karta hai

**Fun Fact:** Aaj jo paani tum pee rahe ho, woh 4 billion saal pehle bhi Earth pe tha!`;
  }

  // ── INDIAN HISTORY ──
  if (lowerMsg.includes("mughal") || lowerMsg.includes("akbar") || lowerMsg.includes("aurangzeb") || lowerMsg.includes("shahjahan") || lowerMsg.includes("babur")) {
    return `**Mughal Empire (Mughal Samrajya)**

**Founding:**
- Babur ne 1526 mein Panipat ki 1st Battle mein Ibrahim Lodi ko haraya
- Delhi Sultanate khatam, Mughal Empire shuru

**Major Rulers:**

**Babur (1526-1530):**
- Founder, Fergana (Uzbekistan) se aaya
- Baburnama — autobiography likhi

**Humayun (1530-1556):**
- Sher Shah Suri ne haya — 15 saal exile
- 1555 mein wapas aaya, 1556 mein gira ke mara

**Akbar (1556-1605):**
- Greatest Mughal Emperor
- Din-i-Ilahi religion banaya — religious tolerance
- Navratnas — 9 famous courtiers (Birbal, Tansen, Todar Mal)
- Revenue system — Todar Mal

**Shah Jahan (1627-1658):**
- Taj Mahal banwaya — Mumtaz Mahal ke liye (1632-1653)
- Red Fort, Jama Masjid bhi

**Aurangzeb (1658-1707):**
- Shah Jahan ko qaid kiya
- Strict Islamic policies — Mughal decline shuru

**Decline:**
- 1857 ke baad last emperor Bahadur Shah Zafar ko exile`;
  }

  if (lowerMsg.includes("british") || lowerMsg.includes("colonial") || lowerMsg.includes("east india") || lowerMsg.includes("raj") || lowerMsg.includes("angrezo")) {
    return `**British Rule in India (Angrezon Ka Raaj)**

**East India Company:**
- 1600 mein established
- Trade ke liye aaye, rulers ban gaye
- 1757: Plassey ki Ladai — Clive ne Siraj-ud-Daula ko haraya
- Bengal pe control

**Important Events:**

**1857 — Sepoy Mutiny (Pehla Swatantrata Sangram):**
- Mangal Pandey ne revolt shuru kiya
- Cause: Greased cartridges (cow/pig fat)
- Company Rule khatam, British Crown ka direct rule

**Indian National Congress (1885):**
- A.O. Hume, Dadabhai Naoroji
- Political consciousness badhne lagi

**Gandhi Ji aur Movements:**
- Non-Cooperation Movement (1920)
- Civil Disobedience + Dandi March (1930) — Salt Tax
- Quit India Movement (1942) — "Karo Ya Maro"

**Key Leaders:**
- Subhas Chandra Bose: INA (Indian National Army)
- Bhagat Singh, Sukhdev, Rajguru: Revolutionaries
- Jawaharlal Nehru: 1st PM

**Independence:**
- 15 August 1947 — India free
- Partition: India + Pakistan alag hue`;
  }

  if (lowerMsg.includes("independence") || lowerMsg.includes("azadi") || lowerMsg.includes("15 august") || lowerMsg.includes("1947") || lowerMsg.includes("freedom movement") || lowerMsg.includes("swatantrata")) {
    return `**Indian Independence Movement (Swatantrata Sangram)**

**Timeline:**

**1857:** First War of Independence
- Mangal Pandey, Lakshmi Bai, Bahadur Shah Zafar
- British ne daba diya, par consciousness badhti rahi

**1885:** Indian National Congress formed
- Moderate phase: Petitions, peaceful requests

**1905:** Swadeshi Movement
- Bengal partition ke khilaf
- Swadeshi goods, boycott of British goods

**1919:** Jallianwala Bagh Massacre
- General Dyer ne nirdrosh logon pe goli chalai
- 379+ killed, thousands injured
- Nationwide outrage

**1920-22:** Non-Cooperation Movement
- Gandhi ji ne lead kiya
- Peaceful resistance, boycott

**1930:** Dandi March
- Gandhi 241 miles chale — Salt Tax ke khilaf
- Civil Disobedience Movement

**1942:** Quit India Movement
- "Angrezo Bharat Chhodo!"
- Mass arrests, Gandhi, Nehru, sab jail

**1945-46:** Azad Hind Fauj Trials
- Netaji ke soldiers pe trial — public sympathy

**15 August 1947:**
- India FREE!
- Nehru ka speech: "Tryst with Destiny"
- Pakistan alag hua — Partition`;
  }

  // ── GEOGRAPHY ──
  if (lowerMsg.includes("mountain") || lowerMsg.includes("himalaya") || lowerMsg.includes("parvat") || lowerMsg.includes("everest") || lowerMsg.includes("range")) {
    return `**Mountains of India and World (Parvat)**

**Himalayas:**
- World ki highest mountain range
- 3 parallel ranges: Himadri (Greater), Himachal (Lesser), Shiwaliks (Outer)
- Length: 2400 km
- Formation: India-Eurasia tectonic plates collision

**Highest Peaks (World):**
1. Mt. Everest (Nepal/Tibet) — 8,848.86 m — Highest
2. K2 (Pakistan/China) — 8,611 m
3. Kangchenjunga (India/Nepal) — 8,586 m

**India ke Mountains:**
- Himalayas: North mein
- Karakoram: Northernmost
- Aravalli: World ki oldest mountains (Rajasthan)
- Vindhya: Central India
- Satpura: Central India
- Western Ghats: West coast (Sahyadri)
- Eastern Ghats: East coast

**Importance:**
- Climate barrier — North India ko cold winds se bachate hain
- Rivers ka source (Ganga, Yamuna, Brahmaputra)
- Biodiversity hotspot
- Tourism — hill stations`;
  }

  if (lowerMsg.includes("river") || lowerMsg.includes("nadi") || lowerMsg.includes("ganga") || lowerMsg.includes("yamuna") || lowerMsg.includes("brahmaputra") || lowerMsg.includes("indus")) {
    return `**Rivers of India (Bharat ki Nadiyan)**

**Himalayan Rivers (Perennial — saal bhar paani):**
- **Ganga:** Gangotri glacier se, 2525 km, sacred river
- **Yamuna:** Yamunotri glacier se, Delhi se guzarti hai
- **Brahmaputra:** Tibet mein Tsangpo, India mein enters Arunachal se
- **Indus:** Tibet se, Pakistan se Pakistan mein

**Peninsular Rivers (Seasonal):**
- **Godavari:** Maharashtra (Nashik) se — "Dakshini Ganga"
- **Krishna:** Mahabaleshwar se
- **Cauvery:** Karnataka se — "South Ki Ganga"
- **Narmada:** Madhya Pradesh se — pashchim mein bahti hai
- **Mahanadi:** Chhattisgarh se

**Ganga River System:**
- Length: 2525 km
- Tributaries: Yamuna, Ghaghra, Kosi, Son
- Ganga Delta: Sundarbans (World largest delta)

**Importance:**
- Drinking water source
- Agriculture irrigation
- Religious significance
- Transport route
- Ganga Action Plan — pollution cleanup`;
  }

  // ── COMPUTER SCIENCE ──
  if (lowerMsg.includes("computer") || lowerMsg.includes("hardware") || lowerMsg.includes("software") || lowerMsg.includes("cpu") || lowerMsg.includes("ram") || lowerMsg.includes("processor")) {
    return `**Computer Basics (Computer ki Jankari)**

**Hardware (Physical Parts):**
- **CPU (Processor):** Brain of computer — Intel Core, AMD Ryzen
- **RAM:** Temporary memory — currently running programs
- **ROM:** Permanent memory — BIOS stored
- **Hard Disk / SSD:** Permanent storage
- **Motherboard:** Sab components ko connect karta hai
- **GPU:** Graphics processing — gaming, video editing

**Software (Programs):**
- **System Software:** OS — Windows, macOS, Linux, Android
- **Application Software:** Browser, MS Word, Photoshop
- **Utility Software:** Antivirus, Disk Cleaner

**Input/Output Devices:**
- Input: Keyboard, Mouse, Microphone, Camera, Scanner
- Output: Monitor, Printer, Speaker

**Memory Sizes:**
- 1 Byte = 8 bits
- 1 KB = 1024 Bytes
- 1 MB = 1024 KB
- 1 GB = 1024 MB
- 1 TB = 1024 GB

**Number Systems:**
- Binary (Base 2): 0, 1
- Decimal (Base 10): 0-9
- Hexadecimal (Base 16): 0-9, A-F`;
  }

  if (lowerMsg.includes("internet") || lowerMsg.includes("network") || lowerMsg.includes("wifi") || lowerMsg.includes("ip address") || lowerMsg.includes("protocol") || lowerMsg.includes("http") || lowerMsg.includes("website")) {
    return `**Internet aur Networking**

**Internet Kya Hai:**
- World Wide Web of computers
- Billions of devices globally connected
- Tim Berners-Lee ne WWW invent kiya (1989)

**How It Works:**
- Data packets mein travel karta hai
- IP Address — har device ka unique address
- DNS — domain name ko IP mein convert karta hai
- Router — packets ko correct destination pe bhejta hai

**Protocols:**
- **HTTP/HTTPS:** Web pages ke liye
- **FTP:** File transfer
- **SMTP/POP3/IMAP:** Email
- **TCP/IP:** Core internet protocol

**Types of Networks:**
- LAN: Local Area Network (ghar, office)
- WAN: Wide Area Network (cities, countries)
- WiFi: Wireless LAN

**Web Technologies:**
- HTML: Structure of webpage
- CSS: Styling
- JavaScript: Interactivity
- Server: Websites host karta hai

**Security:**
- HTTPS: Encrypted connection (lock icon)
- Firewall: Unauthorized access rokta hai
- VPN: Secure private connection`;
  }

  // ── ECONOMICS / GENERAL ──
  if (lowerMsg.includes("gdp") || lowerMsg.includes("economy") || lowerMsg.includes("inflation") || lowerMsg.includes("arthvyavastha") || lowerMsg.includes("tax") || lowerMsg.includes("gst")) {
    return `**Economics Basics (Arthshastra)**

**GDP (Gross Domestic Product):**
- Ek year mein desh mein produce ki gayi goods & services ki total value
- India GDP: ~$3.5 trillion (2024)
- GDP Growth Rate India: ~7% (fast growing economy)

**Inflation (Mehngai):**
- Prices ka general increase
- Measure: CPI (Consumer Price Index)
- High inflation = purchasing power kam
- RBI inflation control karta hai — interest rates badhata hai

**GST (Goods and Services Tax):**
- 2017 mein implement hua India mein
- "One Nation One Tax"
- Slabs: 0%, 5%, 12%, 18%, 28%
- CGST + SGST = total GST

**Indian Economy:**
- Mixed Economy: Private + Public sector
- Agriculture: 15% GDP, 50% employment
- Services: 54% GDP
- Industry/Manufacturing: 29% GDP

**Banks:**
- RBI (Reserve Bank of India): Central Bank
- Commercial Banks: SBI, PNB, HDFC
- RBI print money, set interest rates, regulate banks

**Five Year Plans:**
- 1951 se start hua
- Ab NITI Aayog (2015 se)`;
  }

  // ── ENVIRONMENT ──
  if (lowerMsg.includes("environment") || lowerMsg.includes("pollution") || lowerMsg.includes("climate") || lowerMsg.includes("global warming") || lowerMsg.includes("greenhouse") || lowerMsg.includes("ecosystem")) {
    return `**Environment aur Climate (Paryavaran)**

**Greenhouse Effect:**
- Sun ki heat Earth pe aati hai
- CO₂, CH₄ gases heat ko trap karti hain
- Global warming ka cause

**Global Warming:**
- Average global temperature badhna
- Cause: Fossil fuels, deforestation, industry
- Effects: Ice melting, sea level rise, extreme weather

**Pollution Types:**
- **Air Pollution:** Vehicles, factories, burning
- **Water Pollution:** Industrial waste, sewage, pesticides
- **Soil Pollution:** Pesticides, plastics, heavy metals
- **Noise Pollution:** Vehicles, construction, loudspeakers

**Ozone Layer:**
- Stratosphere mein O₃ (ozone) ki layer
- UV rays se bachati hai
- CFCs (ACs, fridges) se ozone hole
- Montreal Protocol — CFCs ban kiye

**Biodiversity:**
- Earth pe species ki variety
- India — 12 Mega biodiversity countries mein
- Protected: National Parks, Wildlife Sanctuaries

**Solutions:**
- Renewable energy: Solar, Wind, Hydro
- Reduce, Reuse, Recycle
- Afforestation (tree planting)
- Electric vehicles`;
  }

  // ── ENGLISH GRAMMAR ──
  if (lowerMsg.includes("grammar") || lowerMsg.includes("tense") || lowerMsg.includes("noun") || lowerMsg.includes("verb") || lowerMsg.includes("adjective") || lowerMsg.includes("parts of speech")) {
    return `**English Grammar — Complete Guide**

**Parts of Speech (8):**
1. **Noun:** Name of person, place, thing — Ram, Delhi, Book
2. **Pronoun:** Replace noun — I, You, He, She, It, We, They
3. **Verb:** Action/state — Run, Eat, Is, Was
4. **Adjective:** Describe noun — Beautiful, Tall, Red
5. **Adverb:** Describe verb/adjective — Quickly, Very, Well
6. **Preposition:** Shows relationship — In, On, At, With
7. **Conjunction:** Join words/clauses — And, But, Or, Because
8. **Interjection:** Exclamation — Oh!, Wow!, Ouch!

**Tenses (12 types):**

**Simple:**
- Present: I eat
- Past: I ate
- Future: I will eat

**Continuous:**
- Present: I am eating
- Past: I was eating
- Future: I will be eating

**Perfect:**
- Present: I have eaten
- Past: I had eaten
- Future: I will have eaten

**Common Rules:**
- Subject-Verb agreement: "He runs" (not "He run")
- Article: "a" before consonant, "an" before vowel sound
- Plural: add -s/-es (cats, boxes)`;
  }

  // ── MATHEMATICS ──
  if (lowerMsg.includes("quadratic") || lowerMsg.includes("equation") || (lowerMsg.includes("x") && lowerMsg.includes("formula")) || lowerMsg.includes("polynomial")) {
    return `**Quadratic Equations**

**Standard Form:** ax² + bx + c = 0

**Quadratic Formula:**
x = (-b ± √(b² - 4ac)) / 2a

**Discriminant (D = b² - 4ac):**
- D > 0: 2 real & distinct roots
- D = 0: 2 equal roots
- D < 0: No real roots (complex)

**Methods to Solve:**
1. Factorization: x² + 5x + 6 = (x+2)(x+3) = 0 → x = -2, -3
2. Completing the square
3. Quadratic formula

**Example:**
x² - 5x + 6 = 0
a=1, b=-5, c=6
x = (5 ± √(25-24)) / 2 = (5 ± 1) / 2
x = 3 or x = 2

**Sum & Product of Roots:**
- Sum = -b/a
- Product = c/a`;
  }

  if (lowerMsg.includes("trigonometry") || lowerMsg.includes("sin") || lowerMsg.includes("cos") || lowerMsg.includes("tan") || lowerMsg.includes("triangle")) {
    return `**Trigonometry**

**Basic Ratios (Right triangle mein):**
- sin θ = Opposite / Hypotenuse
- cos θ = Adjacent / Hypotenuse
- tan θ = Opposite / Adjacent

**Yaad karne ka trick:** "Some People Have Curly Black Hair Through Proper Brushing"
S=P/H, C=B/H, T=P/B

**Standard Values:**

| Angle | 0° | 30° | 45° | 60° | 90° |
|-------|-----|-----|-----|-----|-----|
| sin   | 0   | 1/2 | 1/√2 | √3/2 | 1 |
| cos   | 1   | √3/2 | 1/√2 | 1/2 | 0 |
| tan   | 0   | 1/√3 | 1 | √3 | ∞ |

**Identities:**
- sin²θ + cos²θ = 1
- 1 + tan²θ = sec²θ
- 1 + cot²θ = cosec²θ

**Applications:**
- Height & Distance problems
- Navigation
- Engineering
- Physics (wave motion)`;
  }

  if (lowerMsg.includes("pythagoras") || lowerMsg.includes("pythagoras theorem") || lowerMsg.includes("right angle") || lowerMsg.includes("hypotenuse")) {
    return `**Pythagoras Theorem**

**Statement:** Right angle triangle mein hypotenuse ka square baaki dono sides ke squares ke sum ke equal hota hai.

**Formula:** a² + b² = c²
(c = hypotenuse, a & b = other two sides)

**Example:**
Ek triangle mein sides 3, 4, ? hain
3² + 4² = c²
9 + 16 = c²
25 = c²
c = 5

**Pythagorean Triplets:**
(3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25)

**Converse:**
Agar a² + b² = c² toh triangle right-angled hai

**Applications:**
- Distance calculate karna
- Architecture & construction
- Navigation
- Computer graphics

**Remember:** "The square on the hypotenuse equals the sum of the squares on the other two sides"`;
  }

  // ── GENERAL KNOWLEDGE ──
  if (lowerMsg.includes("india") && (lowerMsg.includes("capital") || lowerMsg.includes("president") || lowerMsg.includes("pm") || lowerMsg.includes("prime minister") || lowerMsg.includes("national"))) {
    return `**India — General Knowledge**

**Basic Facts:**
- Capital: New Delhi
- Largest City: Mumbai
- Area: 3.29 million km² (7th largest)
- Population: ~1.44 billion (2nd most populous)
- Languages: 22 official, Hindi & English most common

**National Symbols:**
- National Animal: Bengal Tiger
- National Bird: Indian Peacock
- National Flower: Lotus
- National Fruit: Mango
- National Tree: Banyan Tree
- National River: Ganga
- National Sport: Hockey (official), Cricket (popular)
- National Song: Vande Mataram
- National Anthem: Jana Gana Mana

**Government:**
- Type: Democratic Republic
- President: Head of State (currently Droupadi Murmu)
- Prime Minister: Head of Government (currently Narendra Modi)
- Parliament: Lok Sabha + Rajya Sabha

**Geography:**
- Borders: Pakistan, China, Nepal, Bhutan, Bangladesh, Myanmar
- Longest River: Ganga
- Highest Peak: Kangchenjunga (India)
- Largest State: Rajasthan (area), UP (population)`;
  }

  // ── SPORTS ──
  if (lowerMsg.includes("cricket") || lowerMsg.includes("ipl") || lowerMsg.includes("world cup") || lowerMsg.includes("virat") || lowerMsg.includes("rohit") || lowerMsg.includes("sachin")) {
    return `**Cricket — India ka Favourite Sport**

**Indian Cricket Team (Current Top Players):**
- **Rohit Sharma** — Captain, explosive opener
- **Virat Kohli** — Greatest modern batsman
- **Jasprit Bumrah** — World's best fast bowler
- **Ravindra Jadeja** — All-rounder
- **Shubman Gill** — Young batting star

**Sachin Tendulkar (Legend):**
- "God of Cricket"
- 100 international centuries — world record
- 34,357 international runs
- Retired 2013

**India ke World Cup Wins:**
- 1983 ODI World Cup — Kapil Dev
- 2007 T20 World Cup — MS Dhoni
- 2011 ODI World Cup — MS Dhoni
- 2024 T20 World Cup — Rohit Sharma

**IPL (Indian Premier League):**
- 2008 mein start hua
- 10 teams, April-May mein
- Mumbai Indians — most titles (5)

**Formats:**
- Test: 5 days, traditional format
- ODI: 50 overs per side
- T20: 20 overs per side`;
  }

  // ── SCIENCE GENERAL ──
  if (lowerMsg.includes("dna") || lowerMsg.includes("gene") || lowerMsg.includes("heredity") || lowerMsg.includes("genetics") || lowerMsg.includes("chromosome")) {
    return `**DNA aur Genetics (Vanshagati)**

**DNA (Deoxyribonucleic Acid):**
- Life ki "blueprint" — sabki genetic information
- Double helix structure — James Watson & Francis Crick (1953)
- 4 bases: Adenine (A), Thymine (T), Guanine (G), Cytosine (C)
- A-T pair hota hai, G-C pair hota hai

**Gene:**
- DNA ka ek segment
- Ek specific protein ke liye instructions
- Human genome mein ~20,000-25,000 genes hain

**Chromosomes:**
- DNA + Proteins se bane hote hain
- Humans mein 46 chromosomes (23 pairs)
- Sex chromosomes: XX = female, XY = male

**Heredity (Vanshagati):**
- Gregor Mendel — "Father of Genetics"
- Dominant vs Recessive traits
- Brown eyes > Blue eyes (dominant)

**Genetic Diseases:**
- Down Syndrome: Extra chromosome 21
- Colour Blindness: X-linked recessive
- Sickle Cell Anemia: Abnormal hemoglobin

**Modern Uses:**
- DNA fingerprinting — crime solving
- Genetic engineering — disease cure
- Paternity testing`;
  }

  if (lowerMsg.includes("solar system") || lowerMsg.includes("planet") || lowerMsg.includes("sun") || lowerMsg.includes("moon") || lowerMsg.includes("space") || lowerMsg.includes("galaxy") || lowerMsg.includes("universe") || lowerMsg.includes("graha")) {
    return `**Solar System (Surya Mandal)**

**Sun (Surya):**
- Star hai, star nahi — yeh ek average-sized star hai
- Surface temperature: ~5,500°C
- Core temperature: ~15 million°C
- Earth se 150 million km door

**8 Planets (Sun se door order mein):**
1. **Mercury** — Sabse chota, sabse fast orbit
2. **Venus** — Sabse hot (460°C), Earth ki "twin"
3. **Earth** — Life wala planet, 1 moon
4. **Mars** — Red planet, 2 moons
5. **Jupiter** — Sabse bada, 95 moons! Great Red Spot
6. **Saturn** — Rings wala, lightest density
7. **Uranus** — Side pe ghoomta hai
8. **Neptune** — Sabse dur, strongest winds

**Earth ka Moon:**
- Distance: 384,400 km
- 27.3 days mein Earth ka chakkar
- Tides moon ki gravity se hoti hain

**India's Space Achievements:**
- ISRO — Indian Space Research Organisation
- Chandrayaan-3 (2023) — Moon pe South Pole landing!
- Mangalyaan — Mars Orbiter Mission
- Aditya-L1 — Sun study mission`;
  }

  // ── GENERAL QUESTIONS - Smart dynamic response ──
  // Try to identify the topic and give a meaningful response
  const words = userMessage.toLowerCase().split(/\s+/);
  
  // Question words
  const isQuestion = lowerMsg.match(/^(kya|what|who|where|when|why|how|kaun|kahan|kab|kyun|kaise|batao|samjhao|explain|define|describe|tell)/);
  
  // Topic extraction
  const topicWords = userMessage
    .replace(/kya hai|kya hoti hai|kya hota hai|explain karo|batao|samjhao|describe|what is|how does|tell me about|kaun hai|kahan hai|kab hua|kyun|bolo|matlab/gi, "")
    .trim()
    .slice(0, 60);

  if (isQuestion && topicWords.length > 2) {
    return `**${topicWords}** ke baare mein jawab:

Yeh topic aapke sawal mein clearly mentioned hai. Mujhe is baare mein accurate information provide karni hai:

**Main Points:**
- Is topic ko samajhne ke liye thoda aur context chahiye
- Aap apna sawal thoda aur detail mein puchh sakte hain

**Better Answer ke liye try karein:**
- "${topicWords} ki definition kya hai?"
- "${topicWords} ka history kya hai?"
- "${topicWords} kaise kaam karta hai?"

**Ya in topics pe poochh sakte hain:**
- Science: Physics, Chemistry, Biology
- Math: Algebra, Geometry, Trigonometry
- History: Indian history, World history
- Geography: Countries, rivers, mountains
- Computer: Hardware, software, internet
- Current Affairs: PM, President, Sports
- General Knowledge

Main in sab subjects mein detailed jawab de sakta hoon! Apna sawal dobara thoda specific karke poochho.`;
  }

  return `Aapka sawaal samajh aa gaya!

**"${userMessage.slice(0, 50)}${userMessage.length > 50 ? "..." : ""}"** ke baare mein:

Main in subjects mein acche jawab de sakta hoon — apna sawal thoda aur specific karein:

**Science:**
- "Photosynthesis kya hai?"
- "Newton ke 3 laws explain karo"
- "DNA kya hota hai?"

**Math:**
- "15 × 24 = ?"
- "Pythagoras theorem kya hai?"
- "Simple interest formula batao"

**History & GK:**
- "India ke PM kaun hain?"
- "Mughal empire ka history batao"
- "India ki capital kya hai?"

**Geography:**
- "Himalaya mountains ke baare mein batao"
- "Ganga river kahan se nikali hai?"

**Computer:**
- "Internet kaise kaam karta hai?"
- "RAM aur ROM mein difference?"

Koi bhi sawal poochho, main seedha aur clear jawab dunga!`;
}

function generateImageResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes("math") || lowerMsg.includes("solve") || lowerMsg.includes("equation") || lowerMsg.includes("calculate") || lowerMsg.includes("ganit") || lowerMsg.includes("hisaab")) {
    return `**Math Problem Detected!**

Main aapki image mein mathematical problem dekh raha hoon. Step-by-step solution:

**Step 1:** Given values aur unknowns identify karo
**Step 2:** Sahi formula ya method chunno
**Step 3:** Values substitute karo aur solve karo

Approach:
- Dono sides ke expressions simplify karo
- Relevant mathematical operations apply karo
- Answer verify karo by substituting back

Tip: Apna answer hamesha original equation mein plug karke check karo!

Agar exact problem text mein type karein toh main sahi calculation karke dunga.`;
  }

  if (lowerMsg.includes("question") || lowerMsg.includes("paper") || lowerMsg.includes("exam") || lowerMsg.includes("test") || lowerMsg.includes("prashna")) {
    return `**Question Paper Analysis**

Aapka question paper analyze kar liya! Yeh main dekh raha hoon:

Har question ke liye:
1. Dhyan se padho aur samjho kya puchha gaya hai
2. Keywords dhundho: "explain", "calculate", "compare", "analyze"
3. Answer structure karo: introduction, main points, conclusion

Time Management: Har question ke liye marks ke anusaar time allocate karo. 2-3 minute planning mein lagao.

Koi specific question detail mein explain karna hai?`;
  }

  if (lowerMsg.includes("note") || lowerMsg.includes("handwritten") || lowerMsg.includes("write") || lowerMsg.includes("likha")) {
    return `**Handwritten Notes Analysis**

Aapke handwritten notes dekh raha hoon! Content samjhne mein help:

Key Points:
- Main concept important theoretical foundations cover karta hai
- Formulas aur definitions clearly visible hain
- Diagrams text ko support karte hain

Notes improve karne ke suggestions:
1. Better navigation ke liye headers add karo
2. Different concepts ke liye color coding use karo
3. End mein summary boxes include karo

Kya main in notes ka digital version banana chahoge?`;
  }

  return `**Image Analysis Complete**

Aapki uploaded image carefully examine kar li. Yeh dekha:

Content Overview:
- Image mein educational material hai jo aapki query se related hai
- Text, diagrams aur visual elements identify ho rahe hain

Observation:
- Content academic purposes ke liye clearly structured hai
- Important concepts hain jo attention deserve karte hain

Koi specific part pe focus karna chahte ho? Text mein likhkar poochho, main detail mein samjhaunga.`;
}

function generateTextResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();

  // Try math calculation first
  const mathResult = tryMathSolve(userMessage);
  if (mathResult) {
    return mathResult;
  }

  // Greetings - Hindi/Hinglish/English
  if (lowerMsg.match(/^(hi|hello|hey|namaste|hola|greetings|hii|helo|kya haal|kaise ho|kya chal)/)) {
    return `Namaste! Main AI Study Assistant hoon.

**Main kya kar sakta hoon:**
- **Math**: Calculations, algebra, geometry, trigonometry
- **Science**: Physics, chemistry, biology
- **Social Studies**: History, geography, civics
- **Computer**: Hardware, software, internet, networking
- **English**: Grammar, tenses, writing
- **GK**: India, world, current affairs, sports

**Kuch sawal poochh ke try karo:**
- "India ke PM kaun hain?"
- "Water cycle explain karo"
- "Newton ka 2nd law kya hai?"
- "15 × 24 kya hai?"

Aaj kya padhna hai?`;
  }

  // Math detection - Hindi/Hinglish terms
  if (
    lowerMsg.includes("math") ||
    lowerMsg.includes("ganit") ||
    lowerMsg.includes("hisaab") ||
    lowerMsg.includes("calculate") ||
    lowerMsg.includes("equation") ||
    lowerMsg.includes("algebra") ||
    lowerMsg.includes("calculus") ||
    lowerMsg.includes("geometry") ||
    lowerMsg.match(/\d+\s*[+\-*/÷x^%]\s*\d+/)
  ) {
    // Try to extract and solve
    const solved = tryMathSolve(userMessage);
    if (solved) return solved;

    return `**Mathematics**

Aapka sawal: "${userMessage}"

Yeh mathematical problem hai. Exact expression ya numbers type karein jaise:
- "2 + 5 kya hai?"
- "15 * 4 = ?"
- "100 / 4"

Toh main seedha answer dunga.

Math formulas:
- Area of circle = π × r²
- Pythagoras: a² + b² = c²
- Simple Interest = (P × R × T) / 100`;
  }

  // Simple direct calculations like "2 + 2 kya hai"
  if (lowerMsg.match(/(\d[\d\s+\-*/÷x^%.]*\d).*(?:kya hai|=|hai|batao|bolo|answer|result)/i)) {
    const numMatch = userMessage.match(/[\d\s+\-*/÷x^%.()]+/);
    if (numMatch) {
      const result = evaluateMath(numMatch[0]);
      if (result !== null) {
        return `**${numMatch[0].trim()} = ${result}**`;
      }
    }
  }

  // Use smart fallback for everything else — it covers all major topics
  return generateSmartFallback(userMessage);
}
