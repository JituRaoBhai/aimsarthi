/* MORE EXAMS (v11). Loaded after exams.js and before plandata.js. Adds exams to the same EX object, so nothing else needs to know about this file.
   Topic lists follow the commonly published syllabi. Priorities (0-100) and the minutes are PLACEHOLDER estimates: check every list against the latest
   official notification before relying on it, and edit freely. To add an exam: copy one X('key',{...}) block.

   R(subjectPriority, tier, topic, topic, ['Topic with its own priority', 90], ...)
       tier 1 = foundation (studied first), 2 = core, 3 = advanced.
   X(key, {n, grp, mock, defMins:{b,i,a}, crunchMins, t:{ 'Subject': R(...) }})
       grp = heading used in the exam picker.  mock = length of the full paper in minutes. */
(function () {
 const R = (pri, tier, ...tp) => ({ pri, tier, topics: tp.map(x => Array.isArray(x) ? x : [x, pri]) });
 const X = (key, o) => {
  const tier = {}, t = o.t;
  Object.keys(t).forEach(s => { tier[s] = t[s].tier });
  EX[key] = Object.assign({ defMins: { b: 60, i: 45, a: 30 }, crunchMins: 45 }, o, { tier, found: Object.keys(t).filter(s => t[s].tier === 1) });
 };

 /* headings for the exams that already existed in exams.js */
 const G = { neetpg: 'Medical PG and super-speciality', neetss: 'Medical PG and super-speciality', neetug: 'Medical UG (NEET and MBBS)', ssccgl: 'Government jobs', upsc: 'Civil services (UPSC and state)', rajenglish: 'Teaching and research' };
 Object.keys(G).forEach(k => { if (EX[k]) EX[k].grp = G[k] });

 /* ================= MEDICAL PG AND SUPER-SPECIALITY ================= */
 EX.inicet = Object.assign({}, EX.neetpg, { n: 'INI-CET (AIIMS, JIPMER, PGIMER, NIMHANS)', mock: 180, grp: G.neetpg });   // same 19 MBBS subjects as NEET PG

 X('neetssmed', { n: 'NEET SS (Medical Group / DM)', grp: G.neetpg, mock: 180, defMins: { b: 75, i: 55, a: 35 }, crunchMins: 60, t: {
  'Applied Basic Sciences': R(70, 1, 'Applied physiology of the organ systems', 'General pathology and immunology', 'Clinical pharmacology and drug interactions', 'Microbiology and antimicrobial therapy', 'Genetics and molecular medicine', 'Biostatistics and research methodology'),
  'Cardiology': R(90, 2, 'Ischaemic heart disease and acute coronary syndromes', 'Heart failure and cardiomyopathies', 'Valvular and congenital heart disease', 'Arrhythmias, ECG and pacing', 'Hypertension and pulmonary hypertension', 'Pericardial, aortic and peripheral vascular disease', 'Cardiac imaging and interventions'),
  'Respiratory Medicine and Critical Care': R(80, 2, 'Obstructive airway diseases', 'Interstitial and occupational lung disease', 'Pulmonary infections and tuberculosis', 'Pleural disease and lung cancer', 'Pulmonary embolism and sleep disorders', 'ARDS, mechanical ventilation and shock', 'Sepsis and ICU care'),
  'Gastroenterology and Hepatology': R(85, 2, 'Oesophagus and stomach disorders', 'Inflammatory bowel disease and malabsorption', 'Pancreatic and biliary disease', 'Acute and chronic liver disease', 'Cirrhosis, portal hypertension and liver failure', 'GI bleeding and GI infections', 'Liver transplantation and hepatic tumours'),
  'Nephrology': R(80, 2, 'Acute kidney injury', 'Chronic kidney disease and dialysis', 'Glomerular diseases', 'Tubulo-interstitial and cystic disease', 'Fluid, electrolyte and acid-base disorders', 'Renal transplantation', 'Hypertension and the kidney'),
  'Neurology': R(85, 2, 'Stroke and cerebrovascular disease', 'Epilepsy and sleep disorders', 'Movement disorders and dementia', 'Neuromuscular disease and neuropathies', 'Demyelinating and inflammatory disease', 'CNS infections', 'Headache, neuro-oncology and neuro-imaging'),
  'Endocrinology and Metabolism': R(80, 2, 'Diabetes mellitus and its complications', 'Thyroid disorders', 'Pituitary and hypothalamic disorders', 'Adrenal disorders', 'Calcium, bone and parathyroid disease', 'Reproductive endocrinology and puberty', 'Obesity, lipids and inborn errors of metabolism'),
  'Haematology and Oncology': R(80, 2, 'Anaemias and haemoglobinopathies', 'Bleeding and thrombotic disorders', 'Leukaemias and myeloproliferative neoplasms', 'Lymphomas and plasma cell disorders', 'Transfusion medicine and stem cell transplantation', 'Principles of solid-tumour oncology', 'Oncologic emergencies and supportive care'),
  'Rheumatology and Immunology': R(70, 3, 'Rheumatoid arthritis and spondyloarthropathies', 'SLE and connective tissue diseases', 'Vasculitides', 'Crystal arthropathies and osteoarthritis', 'Immunodeficiency and allergy', 'Autoantibodies and laboratory evaluation'),
  'Infectious Diseases and Tropical Medicine': R(75, 3, 'HIV and opportunistic infections', 'Tropical fevers: malaria, dengue, enteric fever, scrub typhus', 'Fungal and parasitic infections', 'Hospital-acquired infection and antimicrobial resistance', 'Vaccination and travel medicine', 'Tuberculosis and non-tuberculous mycobacteria'),
  'Geriatrics, Toxicology and Emergency Medicine': R(60, 3, 'Poisoning and envenomation', 'Geriatric syndromes and polypharmacy', 'Resuscitation and emergency approach', 'Environmental and heat-related illness', 'Palliative care and ethics')
 } });

 X('upsccms', { n: 'UPSC CMS (Combined Medical Services)', grp: G.neetpg, mock: 120, defMins: { b: 60, i: 45, a: 30 }, crunchMins: 45, t: {
  'General Medicine': R(90, 2, 'Cardiovascular system', 'Respiratory system', 'Gastrointestinal and hepatobiliary system', 'Renal and genitourinary diseases', 'Neurology', 'Endocrinology and diabetes', 'Haematology', 'Rheumatology and connective tissue disease', 'Infectious and tropical diseases', 'Psychiatry', 'Dermatology and venereology', 'Poisoning, nutrition and genetics'),
  'Paediatrics': R(70, 2, 'Growth, development and milestones', 'Neonatology', 'Nutrition and vaccination', 'Paediatric infections and respiratory illness', 'Genetic, metabolic and congenital disorders', 'Paediatric cardiology, nephrology and neurology', 'Paediatric emergencies'),
  'Surgery (with ENT, Ophthalmology and Traumatology)': R(90, 2, 'General surgical principles, wounds and shock', 'Gastrointestinal and hepatobiliary surgery', 'Breast, endocrine and head-neck surgery', 'Urology and vascular surgery', 'Cardiothoracic and neurosurgery basics', 'Trauma, burns and orthopaedic injuries', 'ENT', 'Ophthalmology', 'Anaesthesia, radiology and surgical oncology basics'),
  'Obstetrics and Gynaecology': R(85, 2, 'Normal pregnancy and antenatal care', 'Labour and its abnormalities', 'High-risk pregnancy and obstetric complications', 'Postpartum care and neonatal issues', 'Benign gynaecological conditions', 'Gynaecological oncology', 'Infertility, contraception and family planning'),
  'Preventive and Social Medicine': R(90, 1, 'Concepts of health and epidemiology', 'Biostatistics and research methods', 'Communicable disease epidemiology and control', 'Non-communicable diseases and screening', 'National health programmes', 'Maternal and child health', 'Nutrition and environmental health', 'Occupational health and demography', 'Health planning, management and international health')
 } });

 /* ================= MEDICAL UG: MBBS PROFESSIONALS (NMC CBME) ================= */
 X('mbbs1', { n: 'MBBS 1st Professional', grp: G.neetug, mock: 180, defMins: { b: 60, i: 45, a: 30 }, crunchMins: 45, t: {
  'Anatomy': R(90, 1, 'General anatomy and osteology', 'Upper limb', 'Lower limb', 'Thorax', 'Abdomen and pelvis', 'Head, neck and face', 'Neuroanatomy', 'Histology', 'Embryology', 'Genetics and surface anatomy'),
  'Physiology': R(90, 1, 'General physiology, cell and homeostasis', 'Blood and body fluids', 'Nerve and muscle physiology', 'Cardiovascular system', 'Respiratory system', 'Renal system and acid-base', 'Gastrointestinal system', 'Endocrinology and reproduction', 'Central nervous system', 'Special senses and temperature regulation'),
  'Biochemistry': R(85, 1, 'Cell, biomolecules and enzymes', 'Carbohydrate metabolism', 'Lipid metabolism', 'Amino acid and protein metabolism', 'Nucleotides and molecular biology', 'Vitamins, minerals and nutrition', 'Heme, bilirubin and clinical biochemistry', 'Acid-base, endocrine and organ function tests'),
  'Foundation Course and AETCOM': R(40, 1, 'Foundation course modules', 'Communication skills and professionalism', 'Early clinical exposure and ethics')
 } });

 X('mbbs2', { n: 'MBBS 2nd Professional', grp: G.neetug, mock: 180, t: {
  'Pathology': R(90, 1, 'Cell injury, inflammation and repair', 'Haemodynamics and neoplasia', 'Immunopathology and genetics', 'Haematology and blood banking', 'Cardiovascular and respiratory pathology', 'Gastrointestinal and hepatobiliary pathology', 'Renal, genitourinary and breast pathology', 'Endocrine, bone and CNS pathology', 'Clinical pathology'),
  'Pharmacology': R(90, 2, 'General pharmacology', 'Autonomic nervous system drugs', 'Cardiovascular and renal drugs', 'Central nervous system drugs', 'Chemotherapy and antimicrobials', 'Endocrine drugs', 'Autacoids, respiratory and GI drugs', 'Rational prescribing and toxicology'),
  'Microbiology': R(90, 2, 'General bacteriology and sterilisation', 'Immunology', 'Systemic bacteriology', 'Virology', 'Mycology', 'Parasitology', 'Hospital infection and applied microbiology')
 } });

 X('mbbs3a', { n: 'MBBS 3rd Professional (Part 1)', grp: G.neetug, mock: 180, t: {
  'Community Medicine': R(90, 1, 'Concepts of health, disease and epidemiology', 'Screening, communicable and non-communicable disease', 'Biostatistics and demography', 'Nutrition, environment and occupational health', 'Maternal and child health, family planning', 'National health programmes', 'Health administration and management'),
  'Forensic Medicine and Toxicology': R(80, 2, 'Identification, death and post-mortem changes', 'Injuries and wounds', 'Asphyxia and sexual offences', 'Medico-legal procedures and law', 'General and organ-system toxicology', 'Medical ethics'),
  'Ophthalmology': R(75, 2, 'Anatomy, optics and refraction', 'Lids, lacrimal system and conjunctiva', 'Cornea, sclera and uvea', 'Lens and cataract', 'Glaucoma', 'Retina, neuro-ophthalmology and squint', 'Ocular trauma and community ophthalmology'),
  'ENT': R(75, 2, 'Ear: anatomy and diseases', 'Hearing loss and vestibular disorders', 'Nose and paranasal sinuses', 'Pharynx and tonsils', 'Larynx and tracheostomy', 'Head and neck tumours')
 } });

 X('mbbs3b', { n: 'MBBS Final Professional (Part 2)', grp: G.neetug, mock: 180, defMins: { b: 70, i: 50, a: 35 }, t: {
  'General Medicine': R(95, 2, 'Cardiology', 'Respiratory medicine', 'Gastroenterology and hepatology', 'Nephrology', 'Neurology', 'Endocrinology and diabetes', 'Haematology', 'Infectious diseases', 'Rheumatology', 'Emergency medicine and poisoning'),
  'General Surgery': R(95, 2, 'Surgical principles, wounds and infections', 'Breast and endocrine surgery', 'Gastrointestinal surgery', 'Hepatobiliary and pancreatic surgery', 'Urology', 'Vascular surgery', 'Hernia and abdominal wall', 'Trauma, burns and emergency surgery', 'Surgical oncology'),
  'Obstetrics and Gynaecology': R(95, 2, 'Antenatal care and normal labour', 'Complications of pregnancy and labour', 'Operative obstetrics', 'Puerperium and newborn', 'Gynaecological disorders', 'Gynaecological oncology', 'Contraception and infertility'),
  'Paediatrics': R(85, 2, 'Growth, development and nutrition', 'Neonatology', 'Infections, immunisation and respiratory illness', 'Genetic and metabolic disease', 'Paediatric systemic disorders', 'Paediatric emergencies'),
  'Orthopaedics': R(65, 3, 'Fractures and dislocations', 'Bone and joint infections', 'Bone tumours and metabolic bone disease', 'Congenital and paediatric orthopaedics', 'Peripheral nerve injuries and spine'),
  'Allied clinical subjects': R(55, 3, 'Dermatology and venereology', 'Psychiatry', 'Anaesthesiology', 'Radiodiagnosis and radiotherapy', 'Emergency and critical care')
 } });

 /* ================= NURSING ================= */
 X('norcet', { n: 'AIIMS NORCET (Nursing Officer)', grp: 'Nursing', mock: 90, defMins: { b: 50, i: 40, a: 30 }, crunchMins: 40, t: {
  'Anatomy, Physiology and Microbiology': R(75, 1, 'Human anatomy and physiology of the systems', 'Microbiology and infection control', 'Biochemistry and nutrition basics', 'Pharmacology and drug calculation'),
  'Fundamentals of Nursing': R(90, 1, 'Nursing process and nursing theories', 'Vital signs and basic nursing procedures', 'Infection control and asepsis', 'Medication administration', 'First aid and emergency care', 'Ethics, legal aspects and professional nursing'),
  'Medical-Surgical Nursing': R(95, 2, 'Cardiovascular and respiratory nursing', 'Gastrointestinal, renal and urinary nursing', 'Neurological and musculoskeletal nursing', 'Endocrine and haematological nursing', 'Oncology, burns and critical-care nursing', 'Pre-operative and post-operative care', 'Emergency and disaster nursing'),
  'Community Health Nursing': R(80, 2, 'Concepts of community health and epidemiology', 'National health programmes', 'Maternal and child health, immunisation', 'Environmental and occupational health', 'Health education and communication'),
  'Obstetrics and Gynaecological Nursing': R(80, 2, 'Antenatal, intranatal and postnatal care', 'High-risk pregnancy and obstetric emergencies', 'Newborn care', 'Family planning', 'Gynaecological conditions'),
  'Child Health Nursing': R(75, 2, 'Growth, development and paediatric nutrition', 'Paediatric illnesses and nursing care', 'Neonatal conditions', 'Paediatric emergencies and immunisation'),
  'Mental Health Nursing': R(60, 3, 'Psychiatric disorders and nursing care', 'Therapeutic communication and therapies', 'Mental health act and community mental health'),
  'Nursing Education, Management and Research': R(55, 3, 'Principles of teaching and learning', 'Nursing administration and supervision', 'Nursing research and statistics', 'Professional trends and issues'),
  'General Knowledge and Aptitude': R(50, 2, 'Current affairs and health news', 'Basic reasoning and numerical ability', 'General English')
 } });

 /* ================= UGC NET JRF ================= */
 const P1 = () => ({
  'Paper 1: Teaching Aptitude': R(80, 1, 'Teaching: nature, objectives, characteristics and requirements', 'Learner characteristics and learning styles', 'Factors affecting teaching', 'Methods of teaching and teaching aids', 'Evaluation systems: formative, summative, grading'),
  'Paper 1: Research Aptitude': R(80, 1, 'Research: meaning, characteristics and types', 'Steps of research and research methods', 'Research ethics', 'Paper, article, seminar, conference and symposium', 'Thesis writing: characteristics and format'),
  'Paper 1: Comprehension': R(60, 1, 'Reading comprehension passages'),
  'Paper 1: Communication': R(65, 1, 'Communication: meaning, types and characteristics', 'Effective communication: verbal and non-verbal', 'Barriers to communication', 'Mass media and society'),
  'Paper 1: Mathematical Reasoning and Aptitude': R(70, 1, 'Number series, letter series, codes and relationships', 'Fraction, percentage, ratio and proportion', 'Time, speed, distance, profit and loss, interest'),
  'Paper 1: Logical Reasoning': R(80, 1, 'Structure of arguments and deductive and inductive reasoning', 'Venn diagrams and analogies', 'Indian logic: pramanas and anumana', 'Vyapti and hetvabhasa'),
  'Paper 1: Data Interpretation': R(70, 1, 'Sources, acquisition and classification of data', 'Graphical representation and data interpretation'),
  'Paper 1: ICT': R(65, 1, 'ICT: abbreviations and terminology', 'Internet, email and e-governance', 'Digital initiatives in higher education'),
  'Paper 1: People, Development and Environment': R(75, 1, 'Development and environment', 'Pollution and climate change', 'Natural and energy resources', 'Natural hazards and disasters', 'Environmental protocols and policies'),
  'Paper 1: Higher Education System': R(70, 1, 'Higher learning in ancient and post-independence India', 'Conventional and non-conventional learning programmes', 'Professional, technical and skill-based education', 'Value education and environmental education', 'Policies, governance and administration')
 });
 X('netjrfhi', { n: 'UGC NET JRF: Hindi (Paper 1 + Paper 2)', grp: G.rajenglish, mock: 180, defMins: { b: 55, i: 40, a: 30 }, crunchMins: 40, t: Object.assign(P1(), {
  'Paper 2 Hindi: Sahitya ka Itihas': R(90, 2, 'Aadikal: Siddh, Nath, Raso and Apabhramsha literature', 'Bhaktikal: Nirgun and Sagun streams', 'Reetikal: Reetibaddh, Reetisiddh and Reetimukt', 'Adhunik kal: Bharatendu and Dwivedi yug', 'Chhayavad, Pragativad, Prayogvad and Nayi Kavita', 'Samkaleen Hindi sahitya', 'Hindi sahitya itihas lekhan ki parampara'),
  'Paper 2 Hindi: Kavya': R(90, 2, 'Kabir, Jayasi, Surdas and Tulsidas', 'Bihari, Ghananand and Bhushan', 'Maithilisharan Gupt and Jaishankar Prasad', 'Nirala, Pant and Mahadevi Verma', 'Agyeya, Muktibodh and Nagarjun', 'Dharmveer Bharati and Samkaleen kavi'),
  'Paper 2 Hindi: Gadya Vidhayen': R(85, 2, 'Upanyas: Premchand and later novelists', 'Kahani: development and major storytellers', 'Natak and ekanki', 'Nibandh, aalochna and sansmaran', 'Rekhachitra, yatra vrittant and jivani', 'Hindi aatmakatha and anya vidhayen'),
  'Paper 2 Hindi: Kavyashastra and Aalochna': R(85, 2, 'Bharatiya kavyashastra: ras, alankar, riti, vakrokti, dhwani', 'Pashchatya kavyashastra', 'Hindi aalochna ki parampara', 'Aadhunik aalochak and aalochna sampraday'),
  'Paper 2 Hindi: Bhasha aur Bhasha Vigyan': R(85, 2, 'Hindi bhasha ka vikas', 'Devanagari lipi aur varnamala', 'Hindi vyakaran', 'Bhasha vigyan: dhwani, rup, vakya, arth', 'Hindi ki boliyan aur shaili', 'Rajbhasha Hindi aur anuvad'),
  'Paper 2 Hindi: Vimarsh aur Lok Sahitya': R(65, 3, 'Stri vimarsh, dalit vimarsh and adivasi vimarsh', 'Lok sahitya aur lok sanskriti', 'Patrakarita aur media lekhan', 'Pravasi, Sinema aur anya samkaleen vimarsh')
 }) });
 X('netjrfen', { n: 'UGC NET JRF: English (Paper 1 + Paper 2)', grp: G.rajenglish, mock: 180, defMins: { b: 55, i: 40, a: 30 }, crunchMins: 40, t: Object.assign(P1(), {
  'Paper 2 English: Chaucer to Neo-classical Age': R(85, 2, 'Chaucer and medieval literature', 'Renaissance poetry and prose', 'Shakespeare: plays and sonnets', 'Metaphysical poets and Milton', 'Restoration and Augustan: Dryden, Pope, Swift, Johnson', 'Rise of the novel: Defoe, Richardson, Fielding'),
  'Paper 2 English: Romantic and Victorian Literature': R(85, 2, 'Blake, Wordsworth and Coleridge', 'Byron, Shelley and Keats', 'Romantic prose and the novel: Austen and Scott', 'Tennyson, Browning and Arnold', 'Victorian novel: Dickens, Eliot, Hardy', 'Victorian prose and drama'),
  'Paper 2 English: Modern and Contemporary Literature': R(85, 2, 'Hardy, Yeats and Eliot', 'Modernist novel: Joyce, Woolf, Lawrence, Conrad', 'Auden, Larkin and Ted Hughes', 'Modern drama: Shaw, Beckett, Pinter, Osborne', 'Postmodern and contemporary British fiction'),
  'Paper 2 English: American, Indian English, Commonwealth and Postcolonial': R(80, 2, 'American literature: Whitman, Dickinson, Hawthorne, Faulkner, Morrison', 'Indian English poetry and fiction', 'Indian English drama and non-fiction', 'African, Caribbean and Canadian writing', 'Postcolonial texts and translation'),
  'Paper 2 English: Literary Criticism and Theory': R(90, 2, 'Classical and Renaissance criticism: Aristotle, Plato, Sidney', 'Neo-classical and Romantic criticism: Johnson, Coleridge, Wordsworth', 'Victorian and modernist criticism: Arnold, Eliot, Richards, Leavis', 'Formalism, structuralism and post-structuralism', 'Marxism, feminism, psychoanalysis and new historicism', 'Postcolonial theory, cultural studies and ecocriticism'),
  'Paper 2 English: Language, Linguistics and ELT': R(75, 3, 'History of the English language', 'Phonetics, phonology, morphology and syntax', 'Semantics, pragmatics and sociolinguistics', 'Second language acquisition and ELT methods'),
  'Paper 2 English: Research Methodology and Materials': R(65, 3, 'MLA style and research writing', 'Literary terms and rhetoric', 'Research materials and referencing')
 }) });

 /* ================= MANAGEMENT AND LAW ================= */
 X('cat', { n: 'CAT (MBA entrance)', grp: 'Management and law', mock: 120, defMins: { b: 60, i: 45, a: 30 }, crunchMins: 45, t: {
  'Quantitative Ability': R(85, 1, 'Number system', 'Arithmetic: percentages, profit and loss, ratio, mixtures', 'Time, speed, distance and work', 'Algebra: equations, inequalities, functions, logarithms', 'Geometry and mensuration', 'Modern maths: permutation, combination and probability', 'Progressions, sequences and set theory'),
  'Data Interpretation and Logical Reasoning': R(90, 2, 'Tables and bar, line and pie charts', 'Caselets and mixed graphs', 'Arrangements and seating', 'Games and tournaments', 'Venn diagrams, sets and networks', 'Puzzles, binary logic and games of logic'),
  'Verbal Ability and Reading Comprehension': R(90, 1, 'Reading comprehension: science, humanities and business passages', 'Inference and tone questions', 'Para jumbles', 'Para summary and odd sentence out', 'Vocabulary in context and grammar basics')
 } });
 X('clat', { n: 'CLAT UG (Law entrance)', grp: 'Management and law', mock: 120, defMins: { b: 50, i: 40, a: 30 }, crunchMins: 40, t: {
  'English Language': R(80, 1, 'Reading comprehension passages', 'Grammar and sentence correction', 'Vocabulary, idioms and word usage', 'Inference and summary'),
  'Current Affairs including General Knowledge': R(80, 1, 'National and international current events', 'Arts, culture and awards', 'Static GK: history, geography and the Constitution', 'Economy, environment and science news'),
  'Legal Reasoning': R(95, 2, 'Reading passages with legal principles', 'Law of torts and contracts: basics', 'Constitutional law and legal GK', 'Criminal law basics', 'Applying principles to facts'),
  'Logical Reasoning': R(85, 2, 'Critical reasoning and argument analysis', 'Assumptions, conclusions and strengthening or weakening', 'Analogies, patterns and syllogisms', 'Logical sequences'),
  'Quantitative Techniques': R(60, 2, 'Basic arithmetic and percentages', 'Ratio, proportion and averages', 'Data interpretation from passages and graphs', 'Algebra and mensuration basics')
 } });

 /* ================= GOVERNMENT JOBS: RAJASTHAN ================= */
 X('rajpolice', { n: 'Rajasthan Police Constable (Hindi medium)', grp: 'Government jobs', mock: 150, defMins: { b: 45, i: 35, a: 25 }, crunchMins: 35, t: {
  'General Hindi': R(80, 1, 'Varnamala, sandhi, samas and upsarg-pratyay', 'Sangya, sarvanam, visheshan and kriya', 'Muhavare, lokokti and paryayvachi', 'Vakya shuddhi and apathit gadyansh'),
  'Reasoning and Mental Ability': R(85, 1, 'Series, analogy and classification', 'Coding-decoding and blood relations', 'Direction, ranking and order', 'Venn diagrams and non-verbal reasoning'),
  'Basic Mathematics': R(75, 1, 'Number system, HCF and LCM', 'Percentage, profit and loss', 'Ratio, average and time and work', 'Simple and compound interest, mensuration'),
  'Rajasthan: History, Art and Culture': R(90, 2, 'Rajasthan ke rajvansh aur pramukh yuddh', 'Praja mandal andolan aur ekikaran', 'Kila, mandir, chitrakala aur sthapatya', 'Lok nritya, lok sangeet, mele aur tyohar', 'Rajasthan ke sant aur lok devta'),
  'Rajasthan: Geography, Economy and Polity': R(85, 2, 'Bhoutik bhugol: nadiyan, jalvayu, mitti', 'Khanij, krishi aur sinchai', 'Jansankhya aur janjatiyan', 'Rajasthan ki arthvyavastha aur yojanayen', 'Rajasthan ka prashasan, police aur vidhik tantra'),
  'General Knowledge and Current Affairs': R(85, 2, 'Indian history and freedom struggle', 'Indian polity and Constitution', 'Indian geography and economy', 'General science and computer basics', 'Current affairs: national and Rajasthan'),
  'Physical Fitness Preparation': R(60, 3, 'Running endurance and pace', 'Strength, agility and jump practice', 'Diet, recovery and injury prevention')
 } });

 const RAS = lang => ({
  'History of India and Rajasthan': R(90, 2, 'Ancient and medieval India', 'Modern India and the freedom struggle', 'Rajasthan: prehistoric cultures and early dynasties', 'Rajasthan: Rajput states, Mewar, Marwar, Amber and others', 'Rajasthan: 1857, praja mandal and integration'),
  'Art, Culture and Literature': R(85, 2, 'Indian art, architecture and heritage', 'Rajasthan: forts, palaces, temples and architecture', 'Rajasthan: painting schools and handicrafts', 'Rajasthan: folk music, dance, fairs and festivals', 'Rajasthan: languages, dialects, literature, saints and sects'),
  'Geography of India and Rajasthan': R(85, 2, 'Physical geography of India', 'Climate, rivers, soils and vegetation of Rajasthan', 'Agriculture, irrigation and mineral resources', 'Population, tribes and natural regions of Rajasthan'),
  'Polity and Administration': R(90, 1, 'Indian Constitution and its features', 'Parliament, executive and judiciary', 'Panchayati raj and local government', 'Rajasthan government, RPSC and Lokayukta', 'Public policy, RTI and e-governance'),
  'Economy and Rural Development': R(80, 2, 'Indian economy: planning, budget, banking and inflation', 'Rajasthan economy and state budget', 'Government schemes and rural development', 'Agriculture, industry and infrastructure'),
  'Science, Technology and Environment': R(70, 3, 'General science and everyday technology', 'Space, defence, IT and biotechnology', 'Ecology, biodiversity and climate change', 'Environmental laws and Rajasthan environment issues'),
  'Reasoning, Numeracy and Data Interpretation': R(75, 1, 'Logical reasoning and mental ability', 'Basic numeracy', 'Data interpretation and decision making'),
  'Current Affairs': R(85, 3, 'National and international current events', 'Rajasthan current affairs and schemes', 'Awards, sports, books and appointments'),
  'Ethics, Integrity and Aptitude': R(60, 3, 'Ethics and human values', 'Integrity, attitude and emotional intelligence', 'Case studies in public administration'),
  [lang === 'hi' ? 'Hindi Language and Comprehension' : 'English Language and Comprehension']: R(55, 1, ...(lang === 'hi' ? ['Hindi grammar and vocabulary', 'Apathit gadyansh and saransh lekhan', 'Patra, nibandh and anuvad'] : ['English grammar and vocabulary', 'Reading comprehension and precis', 'Letter, essay and translation']))
 });
 X('rashi', { n: 'RAS / RTS (Hindi medium)', grp: G.upsc, mock: 120, defMins: { b: 60, i: 45, a: 30 }, crunchMins: 45, t: RAS('hi') });
 X('rasen', { n: 'RAS / RTS (English medium)', grp: G.upsc, mock: 120, defMins: { b: 60, i: 45, a: 30 }, crunchMins: 45, t: RAS('en') });

 /* subject lists are derived from t, so they have to be rebuilt after anything is added */
 Object.values(EX).forEach(e => { e.sub = Object.keys(e.t) });

 /* exams that have a topic-test question bank in qbank/<key>.js (see tests.js) */
 window.TEST_EXAMS = ['neetpg', 'neetss', 'neetssmed', 'inicet', 'netjrfhi', 'netjrfen', 'upsccms'];
})();
