/* EXAMS: to add a course, add one entry below.

   Recommended rich form (per-subject object):
     t: {
       'Subject': {
         pri: 0-100,          // subject priority (higher = more time, more priority)
         topics: [
           ['Topic name', 0-100],              // priority only; minutes from defMins
           ['Topic name', 0-100, 90, 60, 40]   // priority + beginner/intermediate/advanced minutes
         ]
       }
     }

   Legacy form still works:
     'Subject': ['Topic 1', 'Topic 2']         // priority 60, minutes from defMins

   Optional exam-level fields:
     found: ['Subject', ...]       // foundational subjects, tier 1. Scheduled before all others.
     tier: { 'Subject': 1|2|3 }    // 1=base, 2=core, 3=advanced. Default: 1 if in `found`, else 2.
     defMins: { b, i, a }          // per-topic minutes for Beginner / Intermediate / Advanced.
     crunchMins: 45                // ONE fixed minutes-per-topic used in the 30/60-day crunch plans.
                                   // The crunch plan is identical for every learner regardless of level.
     crunch: { 30: {'Subject': %}, 60: {'Subject': %} }
                                   // explicit % weights for the 1-month and 2-month crunch plans.
                                   // If omitted, weights are auto-derived from subject priorities.

   Priority (0–100) drives both the time a subject/topic gets and whether it survives when time is short.
   Effective topic priority = subjectPri × topicPri / 100.
*/
const EX = {
  neetpg: {
    n: 'NEET PG',
    mock: 210,
    defMins: { b: 75, i: 55, a: 35 },
    crunchMins: 45,
    found: ['Anatomy','Physiology','Biochemistry'],
    tier: {
      'Anatomy':1,'Physiology':1,'Biochemistry':1,
      'Pathology':2,'Pharmacology':2,'Microbiology':2,
      'Forensic Medicine':2,'Community Medicine (PSM)':2,
      'Medicine':3,'Surgery':3,'Obstetrics & Gynaecology':3,'Paediatrics':3,
      'ENT':3,'Ophthalmology':3,'Orthopaedics':3,'Dermatology':3,
      'Psychiatry':3,'Radiology':3,'Anaesthesia':3
    },
    crunch: {
      30: {
        'Medicine':22,'Pathology':16,'Surgery':14,'Pharmacology':12,
        'Microbiology':8,'Obstetrics & Gynaecology':8,'Paediatrics':6,
        'Community Medicine (PSM)':5,'Anatomy':2,'Physiology':2,'Biochemistry':2,
        'Forensic Medicine':1,'Psychiatry':1,'Orthopaedics':1
      },
      60: {
        'Medicine':18,'Pathology':14,'Surgery':12,'Pharmacology':10,
        'Microbiology':8,'Obstetrics & Gynaecology':8,'Paediatrics':7,
        'Community Medicine (PSM)':6,'Anatomy':4,'Physiology':4,'Biochemistry':3,
        'Forensic Medicine':2,'ENT':2,'Ophthalmology':2,'Orthopaedics':3,
        'Dermatology':2,'Psychiatry':2,'Radiology':1,'Anaesthesia':2
      }
    },
    t: {
      'Anatomy': {pri:65, topics:[
        ['Upper and lower limb',70],
        ['Thorax and abdomen',80],
        ['Head, neck and neuroanatomy',85, 100, 75, 50],
        ['Embryology',60],
        ['Histology and genetics',55]
      ]},
      'Physiology': {pri:65, topics:[
        ['General, nerve and muscle',60],
        ['Cardiovascular and respiratory',80, 100, 75, 50],
        ['Renal and GI',75],
        ['Endocrine and reproduction',70],
        ['Neurophysiology and special senses',65]
      ]},
      'Biochemistry': {pri:60, topics:[
        ['Carbohydrate and lipid metabolism',75],
        ['Amino acids and proteins',60],
        ['Vitamins and minerals',55],
        ['Molecular biology and genetics',70],
        ['Enzymes and clinical biochemistry',60]
      ]},
      'Pathology': {pri:95, topics:[
        ['Cell injury, inflammation and repair',85],
        ['Haematology',90, 100, 75, 50],
        ['Neoplasia',90],
        ['Systemic: CVS, respiratory, GI',95, 120, 90, 60],
        ['Systemic: renal, CNS, bone, endocrine',90],
        ['Immunopathology',70]
      ]},
      'Pharmacology': {pri:90, topics:[
        ['General pharmacology',75],
        ['Autonomic and CNS drugs',80],
        ['Cardiovascular and renal drugs',85],
        ['Endocrine and GI drugs',70],
        ['Antimicrobials and chemotherapy',85],
        ['Toxicology and drug interactions',70]
      ]},
      'Microbiology': {pri:80, topics:[
        ['General bacteriology and immunology',75],
        ['Gram-positive and Gram-negative bacteria',80],
        ['Virology',75],
        ['Mycology and parasitology',65],
        ['Sterilisation and hospital infection',60]
      ]},
      'Forensic Medicine': {pri:55, topics:[
        ['Identification and autopsy',55],
        ['Injuries and asphyxia',55],
        ['Toxicology',60],
        ['Medical law and ethics',55],
        ['Sexual offences and forensic psychiatry',50]
      ]},
      'Community Medicine (PSM)': {pri:70, topics:[
        ['Epidemiology and biostatistics',80],
        ['Screening and communicable diseases',70],
        ['Non-communicable diseases',65],
        ['National health programmes',70],
        ['Nutrition and environment',60],
        ['Demography and family planning',60]
      ]},
      'Medicine': {pri:100, topics:[
        ['Cardiology',100, 180, 120, 60],
        ['Respiratory medicine',90, 120, 80, 45],
        ['Gastroenterology and hepatology',85],
        ['Nephrology and electrolytes',85],
        ['Endocrinology',80],
        ['Neurology',90, 120, 85, 50],
        ['Haematology and oncology',80],
        ['Infectious diseases and rheumatology',80]
      ]},
      'Surgery': {pri:95, topics:[
        ['Trauma, burns and critical care',90],
        ['GI and hepatobiliary surgery',90, 120, 85, 50],
        ['Breast, thyroid and endocrine surgery',85],
        ['Urology',75],
        ['Vascular, cardiothoracic and neurosurgery',70],
        ['Paediatric surgery and hernia',70],
        ['Basic surgical principles',75]
      ]},
      'Obstetrics & Gynaecology': {pri:85, topics:[
        ['Normal pregnancy and labour',85],
        ['High-risk pregnancy',85, 100, 75, 50],
        ['Obstetric complications and operations',80],
        ['Gynaecological disorders',75],
        ['Gynaecological oncology',75],
        ['Contraception and infertility',70]
      ]},
      'Paediatrics': {pri:80, topics:[
        ['Growth, development and nutrition',75],
        ['Neonatology',80],
        ['Immunisation',70],
        ['Paediatric infections and respiratory',75],
        ['Paediatric systemic diseases',75],
        ['Genetics and emergencies',70]
      ]},
      'ENT': {pri:55, topics:[
        ['Ear',65],['Nose and paranasal sinuses',60],
        ['Pharynx and larynx',55],['Head and neck tumours',50]
      ]},
      'Ophthalmology': {pri:55, topics:[
        ['Cornea, conjunctiva and lids',60],
        ['Lens, glaucoma and uvea',65],
        ['Retina and neuro-ophthalmology',65],
        ['Optics and squint',55]
      ]},
      'Orthopaedics': {pri:60, topics:[
        ['Fractures and dislocations',75],
        ['Bone and joint infections',60],
        ['Bone tumours',55],
        ['Paediatric orthopaedics',55],
        ['Nerve injuries and spine',60]
      ]},
      'Dermatology': {pri:50, topics:[
        ['Infections and infestations',55],
        ['Papulosquamous and vesiculobullous disorders',55],
        ['Pigmentary disorders and leprosy',50],
        ['Sexually transmitted infections',45]
      ]},
      'Psychiatry': {pri:55, topics:[
        ['Psychotic and mood disorders',65],
        ['Anxiety and personality disorders',55],
        ['Substance use',50],
        ['Child psychiatry and psychopharmacology',50]
      ]},
      'Radiology': {pri:50, topics:[
        ['Radiation physics and safety',40],
        ['Chest and abdominal imaging',55],
        ['Neuro and musculoskeletal imaging',50],
        ['Nuclear medicine and interventional radiology',45]
      ]},
      'Anaesthesia': {pri:55, topics:[
        ['General anaesthesia and airway',65],
        ['Local and regional anaesthesia',55],
        ['Anaesthetic drugs',55],
        ['Monitoring, ICU and CPR',60]
      ]}
    }
  },

  neetss:{n:'NEET SS (Surgical)',mock:180,t:{
    'Perioperative and critical care':['Fluids, electrolytes and acid-base','Shock and resuscitation','Surgical nutrition','Sepsis, SIRS and organ failure','Transfusion, coagulation and thromboprophylaxis','Antibiotics and surgical site infection'],
    'Trauma, burns and wounds':['Polytrauma and ATLS principles','Head, chest and abdominal trauma','Burns resuscitation and care','Wound healing, grafts and scars','Diabetic foot and pressure ulcers'],
    'Surgical gastroenterology':['Oesophagus: achalasia, GERD, carcinoma','Stomach and duodenum, bariatric surgery','Small bowel, appendix and obstruction','Colorectal: IBD, polyps, carcinoma','Anorectal disorders and fistulas','Hernias and abdominal wall'],
    'HPB and transplant surgery':['Liver: abscess, cysts, tumours','Portal hypertension and liver failure','Biliary stones, strictures and cholangiocarcinoma','Pancreatitis and pseudocyst','Pancreatic and periampullary tumours','Transplantation basics'],
    'Surgical oncology':['Cancer biology, staging and screening','Head and neck cancers','Breast cancer','Sarcoma, skin cancer and melanoma','Chemo-radiotherapy and targeted therapy basics','Oncologic emergencies and palliative care'],
    'Endocrine surgery':['Thyroid nodules and carcinoma','Parathyroid and calcium disorders','Adrenal tumours and phaeochromocytoma','MEN syndromes and neuroendocrine tumours'],
    'Urology':['Urolithiasis','BPH and prostate carcinoma','Bladder and renal tumours','Urinary infection and obstruction','Strictures, hypospadias and reflux','Renal transplantation and trauma'],
    'Cardiothoracic and vascular surgery':['Valvular heart disease','Coronary artery disease and CABG','Congenital heart disease','Aortic disease and dissection','Peripheral arterial and venous disease','Lung cancer and thoracic surgery','Cardiopulmonary bypass'],
    'Neurosurgery':['Head injury and raised ICP','Brain tumours','Spine: degenerative and trauma','Aneurysm, SAH and AVM','Hydrocephalus and paediatric neurosurgery','Functional and peripheral nerve surgery'],
    'Paediatric surgery':['Oesophageal atresia and GI anomalies','Abdominal wall defects and diaphragmatic hernia','Hirschsprung disease and anorectal malformations','Biliary atresia and choledochal cyst','Paediatric tumours: Wilms, neuroblastoma','Paediatric urology'],
    'Plastic and reconstructive surgery':['Flaps and grafts','Hand injuries and tendon repair','Cleft lip and palate, craniofacial','Burn reconstruction','Microsurgery and free tissue transfer'],
    'Applied basic sciences and imaging':['Surgical anatomy: neck, abdomen, pelvis','Physiology of GI, endocrine and cardiac systems','Pathology of tumours and inflammation','Imaging choices: CT, MRI, ultrasound','Research methods and biostatistics']}},

  /*
 * NEET (UG) — National Eligibility cum Entrance Test (Undergraduate)
 * Conducting body: NTA | Syllabus authority: NMC (50 units: 20 Physics, 20 Chemistry, 10 Biology)
 * Paper pattern (pre-COVID format restored from 2025 onward):
 *   - 180 compulsory MCQs in 180 minutes (720 marks; +4 correct, -1 incorrect, 0 unattempted)
 *   - Section B optional questions and the 200-minute window are discontinued
 *   - Question split: Botany (45), Zoology (45), Chemistry (45), Physics (45)
 * Syllabus decomposition:
 *   - Divided into 8 subjects matching paper sections and NCERT/NMC sub-disciplines
 *   - All 50 official NMC units are mapped in pedagogical order (56 topics total)
 */
neetug: {
  n: 'NEET (UG)',
  mock: 180,
  defMins: { b: 60, i: 45, a: 30 },
  crunchMins: 45,
  found: [
    'Botany',
    'Physical Chemistry',
    'Physics — Mechanics',
  ],
  tier: {
    'Botany': 1,
    'Physical Chemistry': 1,
    'Physics — Mechanics': 1,
    'Zoology': 2,
    'Physics — Electrodynamics, Optics & Modern': 2,
    'Organic Chemistry': 2,
    'Inorganic Chemistry': 2,
    'Physics — Thermal, Waves & Experimental': 3,
  },
  crunch: {
    // Prioritises the 360-mark Biology core, high-ROI Class 12 Physics, and NCERT Chemistry while trimming earlier Tier-1 foundations and cutting time-heavy Mechanics/Waves in the 30-day plan
    30: {
      'Zoology': 28,
      'Botany': 24,
      'Physics — Electrodynamics, Optics & Modern': 18,
      'Organic Chemistry': 12,
      'Inorganic Chemistry': 10,
      'Physical Chemistry': 8,
    },
    60: {
      'Zoology': 24,
      'Botany': 22,
      'Physics — Electrodynamics, Optics & Modern': 15,
      'Organic Chemistry': 11,
      'Inorganic Chemistry': 9,
      'Physical Chemistry': 8,
      'Physics — Mechanics': 7,
      'Physics — Thermal, Waves & Experimental': 4,
    },
  },
  t: {
    'Botany': {
      pri: 96,
      topics: [
        ['Cell Structure and Function — Cell: The Unit of Life, Biomolecules and Cell Division', 95],
        ['Diversity in Living World — What is Living, Biodiversity, Classification, Monera, Protista and Fungi', 84],
        ['Diversity in Living World — Plant Kingdom (Algae, Bryophytes, Pteridophytes, Gymnosperms and Angiosperms)', 80],
        ['Structural Organisation in Plants — Morphology, Anatomy and Families of Flowering Plants', 86],
        ['Plant Physiology — Photosynthesis, Respiration and Plant Growth Regulators', 88, 90, 68, 45],
        ['Sexual Reproduction in Flowering Plants', 85],
        ['Genetics — Principles of Inheritance, Variation and Molecular Basis of Inheritance', 98, 95, 70, 45],
        ['Biology and Human Welfare — Microbes in Human Welfare', 68],
        ['Ecology and Environment — Organisms and Populations, Ecosystem, Biodiversity and Conservation', 92],
      ],
    },
    'Zoology': {
      pri: 95,
      topics: [
        ['Structural Organisation in Animals — Animal Tissues, Morphology and Anatomy of Frog and Cockroach', 82],
        ['Diversity in Living World — Animal Kingdom (Non-Chordates and Chordates)', 88],
        ['Human Physiology I — Breathing and Exchange of Gases, Body Fluids and Circulation, Excretory Products', 92, 90, 68, 45],
        ['Human Physiology II — Locomotion and Movement, Neural Control and Coordination, Chemical Coordination', 90, 90, 68, 45],
        ['Reproduction — Human Reproduction and Reproductive Health', 88],
        ['Evolution — Origin of Life, Darwinism, Mechanism of Evolution and Hardy-Weinberg Principle', 76],
        ['Biology and Human Welfare — Human Health and Diseases, Immunology, Cancer and Substance Abuse', 85],
        ['Biotechnology and Its Applications — Principles, Recombinant DNA Technology and Applications', 96],
      ],
    },
    'Physics — Electrodynamics, Optics & Modern': {
      pri: 88,
      topics: [
        ["Electrostatics — Coulomb's Law, Electric Field, Gauss's Law, Electric Potential, Dipoles and Capacitors", 86],
        ["Current Electricity — Ohm's Law, Drift Velocity, Resistor/Cell Combinations, Kirchhoff's Laws and Bridges", 94],
        ["Magnetic Effects of Current and Magnetism — Biot-Savart Law, Ampere's Law, Galvanometer and Magnetic Materials", 86],
        ["Electromagnetic Induction and Alternating Currents — Faraday's Law, Inductance, LCR Circuit and Transformers", 84],
        ['Optics — Ray Optics, Optical Instruments, Wave Optics, Interference, Diffraction and Polarisation', 92, 95, 70, 45],
        ['Dual Nature of Matter and Radiation, Atoms and Nuclei — Photoelectric Effect, Bohr Model and Radioactivity', 95],
        ['Electronic Devices — Semiconductors, p-n Junction Diode, LED, Photodiode, Zener Diode and Logic Gates', 92],
      ],
    },
    'Organic Chemistry': {
      pri: 84,
      topics: [
        ['Some Basic Principles of Organic Chemistry — IUPAC, Isomerism, Electronic Effects and Reaction Intermediates', 96],
        ['Purification and Characterisation of Organic Compounds — Qualitative and Quantitative Elemental Analysis', 68],
        ['Hydrocarbons — Alkanes, Alkenes, Alkynes and Aromatic Hydrocarbons', 88],
        ['Organic Compounds Containing Halogens — Haloalkanes, Haloarenes, SN1, SN2 and Elimination Reactions', 78],
        ['Organic Compounds Containing Oxygen — Alcohols, Phenols, Ethers, Aldehydes, Ketones and Carboxylic Acids', 95, 95, 70, 45],
        ['Organic Compounds Containing Nitrogen — Amines, Cyanides, Isocyanides and Diazonium Salts', 82],
        ['Biomolecules — Carbohydrates, Proteins, Enzymes, Vitamins, Nucleic Acids and Hormones', 80],
      ],
    },
    'Physical Chemistry': {
      pri: 81,
      topics: [
        ['Some Basic Concepts in Chemistry — Mole Concept, Stoichiometry and Empirical/Molecular Formulae', 85],
        ['Atomic Structure — Bohr Model, Dual Nature of Matter, Quantum Numbers and Electronic Configurations', 86],
        ['Chemical Thermodynamics — Laws of Thermodynamics, Enthalpy, Entropy and Gibbs Free Energy', 88],
        ['Equilibrium — Chemical and Ionic Equilibrium, Ionisation, Buffer Solutions and Solubility Product', 90],
        ['Redox Reactions and Electrochemistry — Nernst Equation, Conductance, Kohlrausch Law and Galvanic Cells', 88],
        ["Solutions — Concentration Terms, Raoult's Law, Colligative Properties and Van't Hoff Factor", 82],
        ['Chemical Kinetics — Rate Laws, Order and Molecularity, Integrated Rate Equations and Arrhenius Equation', 84],
      ],
    },
    'Inorganic Chemistry': {
      pri: 78,
      topics: [
        ['Classification of Elements and Periodicity in Properties — Periodic Trends in Atomic and Ionisation Properties', 80],
        ['Chemical Bonding and Molecular Structure — VSEPR Theory, Hybridisation, Molecular Orbital Theory and H-Bonding', 96],
        ['p-Block Elements — Group 13 to Group 18 General Trends, Anomalous Behaviour and Electronic Configurations', 82],
        ['d- and f-Block Elements — Transition Metals, Lanthanoids, Actinoids, KMnO4 and K2Cr2O7', 85],
        ['Co-ordination Compounds — IUPAC Nomenclature, Isomerism, Valence Bond Theory and Crystal Field Theory', 94],
        ['Principles Related to Practical Chemistry — Qualitative Salt Analysis, Titrimetry and Functional Group Tests', 65],
      ],
    },
    'Physics — Mechanics': {
      pri: 72,
      topics: [
        ['Physics and Measurement — SI Units, Least Count, Significant Figures, Errors and Dimensional Analysis', 82],
        ['Kinematics — Frame of Reference, Straight-Line Motion, Vectors, Projectile and Relative Motion', 78],
        ["Laws of Motion — Newton's Laws, Impulse, Conservation of Linear Momentum, Friction and Circular Dynamics", 84],
        ['Work, Energy and Power — Work-Energy Theorem, Conservative Forces, Potential Energy and Collisions', 82],
        ['Rotational Motion — Centre of Mass, Torque, Angular Momentum, Moment of Inertia and Rolling Motion', 85, 95, 70, 45],
        ['Gravitation — Universal Law of Gravitation, Acceleration Due to Gravity, Potential Energy and Satellites', 76],
        ['Properties of Solids and Liquids — Stress-Strain, Viscosity, Surface Tension, Bernoulli Theorem and Heat Transfer', 78],
      ],
    },
    'Physics — Thermal, Waves & Experimental': {
      pri: 56,
      topics: [
        ['Thermodynamics — Thermal Equilibrium, First and Second Laws, Isothermal and Adiabatic Processes', 84],
        ['Kinetic Theory of Gases — Ideal Gas Pressure, RMS Speed, Degrees of Freedom and Mean Free Path', 72],
        ['Oscillations and Waves — Simple Harmonic Motion, Energy in SHM, Pendulum, Wave Motion and Beats', 70],
        ['Electromagnetic Waves — Displacement Current, EM Wave Characteristics and Electromagnetic Spectrum', 58, 30, 20, 15],
        ['Experimental Skills — Vernier Callipers, Screw Gauge, Meter Bridge, Resonance Tube and Diode Curves', 64],
      ],
    },
  },
},
   
  sscgl:{n:'SSC CGL',mock:60,t:{
    'Quantitative Aptitude':['Percentage, profit and loss','Ratio, time and work','Algebra and number system','Geometry and mensuration','Trigonometry','Data interpretation'],
    'Reasoning':['Analogies and classification','Series and coding-decoding','Blood relations and directions','Syllogism and Venn diagrams','Puzzles and seating arrangement','Non-verbal reasoning'],
    'English':['Grammar and error spotting','Vocabulary, synonyms and idioms','Reading comprehension','Cloze test and para jumbles'],
    'General Awareness':['History and culture','Geography and environment','Polity and economy','General science','Current affairs']}},

  upsc:{n:'UPSC CSE',mock:240,t:{
    'Polity':['Constitution and fundamental rights','Parliament and executive','Judiciary and federalism','Local government and governance','Constitutional bodies and amendments'],
    'History':['Ancient and medieval India','Modern India and freedom struggle','Art and culture','World history'],
    'Geography':['Physical geography','Indian geography','World and human geography','Climate and oceans'],
    'Economy':['Basic concepts and national income','Banking, money and inflation','Budget, taxation and fiscal policy','Agriculture and industry','External sector'],
    'Environment':['Ecology and biodiversity','Climate change and conventions','Environmental laws and conservation'],
    'Science & Tech':['Space, defence and nuclear','Biotechnology and health','IT, AI and emerging technology'],
    'Current Affairs':['Government schemes and policies','International relations','Reports, indices and summits'],
    'CSAT':['Comprehension','Logical reasoning','Basic numeracy and data interpretation']}},

  rajenglish:{n:'Rajasthan 2nd Grade English (द्वितीय श्रेणी अंग्रेज़ी)',mock:120,t:{
    'English Grammar (व्याकरण)':[
      'Tenses (काल) — Present, Past, Future के सभी रूप',
      'Articles (आर्टिकल्स) — a, an, the के प्रयोग',
      'Prepositions (संबंधसूचक शब्द)',
      'Voice (वाच्य) — Active और Passive',
      'Narration (नरेशन) — Direct और Indirect Speech',
      'Modals (मॉडल्स) — can, may, must, should',
      'Subject–Verb Agreement (कर्ता–क्रिया अनुरूपता)',
      'Conditional Sentences (शर्तवाचक वाक्य)',
      'Clauses और Sentence Structure',
      'Common Errors (सामान्य अशुद्धियाँ)'],
    'Vocabulary (शब्द भंडार)':[
      'Synonyms (समानार्थी शब्द)',
      'Antonyms (विलोम शब्द)',
      'One Word Substitution (एक शब्द प्रतिस्थापन)',
      'Idioms and Phrases (मुहावरे एवं लोकोक्तियाँ)',
      'Spelling और Pronunciation (वर्तनी)',
      'Word Formation — Prefix, Suffix',
      'Homonyms और Homophones'],
    'Phonetics (ध्वनि विज्ञान)':[
      'Vowels और Consonants (स्वर एवं व्यंजन)',
      'Diphthongs और Minimal Pairs',
      'Stress (बल) और Intonation (स्वर-उतार-चढ़ाव)',
      'Phonetic Transcription (ध्वन्यात्मक लिप्यंतरण)',
      'RP और Indian English के अंतर'],
    'Literature (साहित्य)':[
      'Poetry (काव्य) — Forms और Devices',
      'Prose (गद्य) — Essay, Short Story',
      'Drama (नाटक) — Elements और Types',
      'Fiction (कथा साहित्य) — Novel',
      'Literary Terms और Figures of Speech (अलंकार)',
      'Major Indian Writers in English',
      'Major British Writers — Romantic, Victorian, Modern'],
    'Comprehension (गद्यांश बोध)':[
      'Unseen Passage (अपठित गद्यांश)',
      'Cloze Test',
      'Para Jumbles',
      'Note Making और Summary Writing'],
    'Language Teaching (भाषा शिक्षण)':[
      'Methods of Teaching English (शिक्षण विधियाँ)',
      'Approaches — Communicative, Direct, Structural',
      'Teaching Aids (शिक्षण सामग्री)',
      'LSRW Skills (सुनना, बोलना, पढ़ना, लिखना)',
      'Evaluation और Testing (मूल्यांकन)',
      'Remedial Teaching (उपचारात्मक शिक्षण)',
      'Lesson Planning (पाठ योजना)'],
    'Translation (अनुवाद)':[
      'Hindi to English (हिंदी से अंग्रेज़ी)',
      'English to Hindi (अंग्रेज़ी से हिंदी)',
      'Translation Theory और Problems',
      'Idiomatic Translation'],
    'Educational Psychology (शिक्षा मनोविज्ञान)':[
      'Learning Theories (अधिगम सिद्धांत)',
      'Motivation (अभिप्रेरणा)',
      'Intelligence और Aptitude (बुद्धि एवं अभिक्षमता)',
      'Personality (व्यक्तित्व)',
      'Adolescence (किशोरावस्था)',
      'Individual Differences (व्यक्तिगत विभिन्नताएँ)'],
    'Rajasthan General Knowledge (राजस्थान सामान्य ज्ञान)':[
      'राजस्थान का इतिहास एवं संस्कृति',
      'राजस्थान का भूगोल',
      'राजस्थान की कला एवं स्थापत्य',
      'राजस्थान की राजनीति एवं प्रशासन',
      'राजस्थान की अर्थव्यवस्था',
      'राजस्थान की शिक्षा व्यवस्था']}}
};
Object.values(EX).forEach(e=>e.sub=Object.keys(e.t));
