/* ═══════════════════════════════════════════════════════════════════════
   PORTFOLIO CONTENT — edit text, projects and objects here.
   Nothing in this file renders anything; js/app.js reads it.

   Adding a project:
     1. Put its images in /img (and proposal pages in /img/proposals/<slug>/01.webp …)
     2. Run  python3 tools/build_images.py   (sizes + 800 px variants)
     3. Add an entry to `projects` below — copy an existing one as a template.
   ═══════════════════════════════════════════════════════════════════════ */

/* Everything below is the DEFAULT content. Once Firebase is connected, the
   admin panel (Account tab) can publish edits that replace any of it for all
   visitors — see setContent() at the end of this file. */

/* Set `url` to the live address (e.g. 'https://example.com/') to emit
   absolute canonical / Open Graph URLs. Left empty, the current address is used. */
let SITE = {
  url: '',
  name: 'Amikat',
  title: 'Amikat — Architecture & Data Center Portfolio',
  description: 'An architecture and data center design portfolio: data halls resolved inside existing buildings, technical documentation, BIM and visualisation.',
  ogImage: 'img/og-cover.jpg'
};

const NEEDS = '__NEEDS__';

let profile = {
  name: 'MohammadAmin Sadeghi',
  role: 'Architectural & Data Center Designer',
  location: 'Tehran, Iran',
  status: 'Available for selected projects',


  heroLine: 'Technical space, resolved.',
  heroSub: 'I design data centers and the architecture around them — rack plates, containment, cooling and service routes worked out against buildings that are already standing, then documented so they can be built.',


  aboutLead: 'An architect who works where the drawing has to be correct before it can be elegant.',
  about: [
    'I am an architectural designer working across data center planning, technical documentation, BIM and 3D visualisation. Most of my work is retrofit: an existing hall, a fixed column grid, a slab level that cannot move, and an equipment schedule that has to fit inside all of it.',
    'My architectural training shaped how I think about structure, proportion, hierarchy and systems. I apply the same thinking to infrastructure — rack rows, containment, cabling and service clearances — where the difference between a good plan and a bad one is measured in whether a technician can reach the back of a cabinet.',
    'I like turning dense technical information into drawings people can actually read, and I write my documents so that what is established and what is still open are never confused with each other.'
  ],

  email: 'sadeghimohammadamin83@gmail.com',
  socials: [ {label:'LinkedIn', url:'https://linkedin.com/in/aminetun', handle:'in/aminetun'} ],

  cvPath: '',
  cvReady: false,
  footNote: 'Designed and developed with intention.'
};

let CATEGORIES = ['Data Center Design','Technical Documentation','Architecture','Urban Planning'];


let services = [
  { n:'01', title:'Existing-condition review',
    body:'Survey and as-built review of what is actually there — dimensions, structural constraints, access-floor extent, existing services — and a written register of every discrepancy that needs verifying before design starts.' },
  { n:'02', title:'Space planning & zoning',
    body:'Functional zoning of the hall and adjacent spaces: IT space, plant, support, circulation, controlled-access thresholds and expansion reserve, with room naming and numbering.' },
  { n:'03', title:'Rack & equipment layout',
    body:'Rack plate and equipment arrangement developed against confirmed requirements — positions, orientation, numbering, spacing, containment strategy and service zones.' },
  { n:'04', title:'Clearance & circulation',
    body:'Equipment clearance verified front, rear and side; delivery and replacement routes; human and service circulation kept separate; escape-route implications recorded for the fire consultant.' },
  { n:'05', title:'Cooling & fabric coordination',
    body:'Spatial coordination of cooling equipment with the rack arrangement, raised-floor setting-out, perforated-tile positions, and coordination of partitions, doors and openings with plant and containment.' },
  { n:'06', title:'BIM development',
    body:'The coordinated design built in Revit at real dimensions — architectural fabric, access floor, equipment families, rooms — with the views and schedules that document it.' },
  { n:'07', title:'Visualisation',
    body:'Model-based axonometrics, cutaways and interior views that communicate spatial relationships and design intent to people who do not read plans.' },
  { n:'08', title:'Documentation & proposals',
    body:'Coordinated drawing sets and client-facing proposals, written so that established figures, derived figures and open items are each marked as what they are.' }
];


let processPhases = [
  ['01','Discover','Survey the site or the existing model. Establish what genuinely cannot move — structure, slab level, risers, budget — before proposing anything.'],
  ['02','Define','Turn the brief into measurable constraints: load, clearance, aisle width, service routes. A constraint you can draw is worth ten you can only describe.'],
  ['03','Explore','Test several layouts against the same constraints rather than refining the first one. Comparison makes the decision, not preference.'],
  ['04','Design','Develop the chosen scheme in BIM at real dimensions — every rack, unit and route modelled, so clashes surface here rather than on site.'],
  ['05','Test','Walk the model. Check every service clearance, door swing and maintenance access, and revise where the drawing works but the building would not.'],
  ['06','Deliver','Issue a coordinated drawing set and, where it helps, a visual narrative the client can follow without reading plans.']
];


let skillGroups = [
  { title:'Data center', items:['Data hall layout design','Rack & containment planning','Cooling coordination','Raised-floor setting-out','Clearance & circulation verification','As-built documentation'] },
  { title:'Architecture', items:['Architectural planning','Retrofit & conversion','Technical documentation','Site & existing-condition analysis','Drawing-set production'] },
  { title:'Software', items:['Revit','AutoCAD','Enscape','D5 Render','3ds Max','SketchUp','IFC / DXF workflows'] },
  { title:'Visual & digital', items:['Architectural visualisation','Diagram & sheet design','InDesign · Photoshop · Illustrator','UI / UX design','WordPress','HTML & CSS (basic)'] }
];


let home = {
  stats:[ {n:'projects',label:'Projects in the portfolio'},
          {v:120, plus:true, label:'Rack positions laid out'},
          {n:'pages',label:'Proposal pages designed'},
          {n:'objects',label:'3D / BIM objects built'} ],
  platforms:{ eyebrow:'Platforms I designed', title:'Two web platforms I designed and built.',
    items:[
      { name:'Amin DCI', kind:'Data center intelligence', url:'https://a.rosaqsmn.chatgpt.site/',
        note:'Open with a VPN',
        body:'A monitoring and operations platform for data centers — one place to see the infrastructure, its health and what needs attention.',
        features:['Inventory of sites, rooms, racks and devices, with their relationships',
                  'Live alerts by severity — critical, warning, normal',
                  'Floor plans with the physical rack layout',
                  'Power (IT, facility, PUE) and environment (temperature, humidity)',
                  'Operations & maintenance — acknowledge, schedule, report'],
        tags:['NetBox sync','Zabbix integration','Health score 0–100'] },
      { name:'KautBIM', kind:'BIM & 3D object library', url:'https://kautbim.freebuff.app/',
        body:'A library for the BIM and 3D objects I build — organised by discipline and ready to drop into real architectural and engineering workflows.',
        features:['Objects organised by discipline — data center, HVAC, electrical, mechanical and more',
                  'Accurate dimensions and structured BIM parameters',
                  'Multiple formats — RFA, RVT, FBX, OBJ, SKP',
                  'Works in Revit, SketchUp, 3ds Max, Blender, AutoCAD and Rhino'],
        tags:['Architects','BIM modellers','MEP engineers'] }
    ]},
  audience:{ eyebrow:'Who I work with', title:'For the teams who build and run technical space.',
    items:['Telecom operators','Data center owners','Architecture firms','Engineering consultants','MEP engineers','Fit-out contractors','BIM coordinators','Facility managers'] },
  approach:{ eyebrow:'Approach', title:'Correct first, then clear.',
    lead:'Every layout starts from the building that is already there — the grid, the slab, the openings — and ends as a drawing a contractor can build from without guessing.',
    items:[
      {icon:'target', title:'Existing first', body:'Survey and as-built review before any rack is placed, so the design answers the real room.'},
      {icon:'layers', title:'Model-based', body:'Plans, sections, schedules and views all come out of one coordinated Revit model.'},
      {icon:'shield', title:'Nothing assumed', body:'What is established and what is still open are recorded separately and never confused.'},
      {icon:'eye', title:'Readable', body:'Axonometrics and renders that explain the space to people who do not read plans.'}
    ]},
  disciplines:{ eyebrow:'What I do', title:'Organised by discipline. Drawn for precision.',
    items:['Data center layout','Rack & containment','Cooling coordination','Clearance & circulation','Retrofit & conversion','BIM development','Technical documentation','Visualisation'] },
  software:{ eyebrow:'Tools', title:'Files that work where you work.',
    items:['Revit','AutoCAD','Enscape','D5 Render','3ds Max','SketchUp','IFC / DXF'] }
};


let experience = [
  { org:'Padisar Informatics', role:'Architectural, Data Center & Digital Designer',
    duties:['Architectural and technical layouts for data center projects','Rack plates, containment strategies and service-route coordination','BIM models and coordinated drawing packages','Client-facing design proposals and technical documentation','3D visualisation and animated assembly sequences','Corporate web pages designed and built in WordPress'] },
  { org:'Adobe Design Software Instruction', role:'Instructor',
    duties:['Taught Photoshop, Illustrator, InDesign and Adobe XD','Prepared practical exercises and student project briefs','Reviewed and critiqued student work'] },
  { org:'Sanat Pajouhan Matrah', role:'Technical and Administrative Specialist',
    duties:['Technical reports and office documentation','Technical record-keeping in Excel and Word','Technical inspection documentation'] }
];
let freelanceNote = 'Alongside employed work I take on selected freelance projects — data hall layout studies, BIM documentation, architectural visualisation and design proposals. Availability is limited and I take work where the technical brief is clear.';


let projects = [
{
  slug:'modular-data-centre',
  kind:'Modular', deliver:['Drawings', 'Renders'],
  status:'DESIGN DEVELOPMENT', discipline:'Modular infrastructure',
  groups:[
    ['Exploded sequence',['v01.webp','v02.webp','v03.webp','v04.webp']],
    ['Plan & elevation',['v05.webp','v06.webp']],
    ['Exterior & interior',['v07.webp','v08.webp']]
  ],
  title:'Modular Data Center',
  kicker:'Every component modelled at its real size',
  category:'Data Center Design', year:'2026', tier:'featured',
  summary:'A containerised facility modelled end to end in BIM — enclosure, cabinets, UPS, in-row cooling, cable ladder and external condenser plant — documented through cutaways, exploded axonometrics and an assembly sequence.',
  role:'3D modelling · technical coordination · visualisation · drawing production',
  tools:['Revit','Enscape','AutoCAD','3ds Max','FBX / IFC'],
  type:'Containerised / modular facility — 20 ft enclosure',
  timeline:'2026',
  cover:{src:'v09.webp',label:'Cutaway axonometric',aspect:'wide',r:1.29},
  facts:[['Enclosure','20 ft container'],['Arrangement','Single-sided cabinet row with in-row cooling interleaved'],
         ['Plant','External condenser units'],['Deliverables','Cutaways · exploded axonometrics · layer-by-layer assembly']],
  overview:'A complete facility inside a shipping-container enclosure. Every component was modelled — the cabinet row, in-row cooling, UPS, electrical panel, cable ladder, lighting, cameras, doors and external condensers — so the assembly could be checked for clash and clearance before anything was fabricated.',
  challenge:'A container gives almost no tolerance. Cabinet depth, in-row cooling width, door swing and the service aisle all have to fit inside a fixed internal width, with cable ladder and cooling pipework sharing one ceiling void.',
  approach:'The enclosure was modelled as separable layers — floor, walls, ceiling, cabinets, cooling, electrical, cabling, security — each exported individually, so the assembly could be shown building up one system at a time. A white-model language carries depth through shadow alone, which keeps a cutaway of thirty components legible.',
  solution:'A single-sided cabinet row with in-row cooling interleaved between cabinets, plant concentrated at the door end, and a full-length service aisle opposite — one clear walking route end to end, whichever cabinet is being worked on.',
  learned:'Modelling every component at true dimensions costs the time up front and saves all of it later. The clashes it exposed — a door swing against a panel, a ladder against a cooling pipe — would each have been a site problem.',
  gallery:[
    {src:'v07.webp',label:'Exterior',caption:'Container enclosure with external condenser plant.',aspect:'wide',r:1.29},
    {src:'v08.webp',label:'Interior',caption:'Cabinet row and service aisle inside the enclosure.',aspect:'wide',r:1.29},
    {src:'v01.webp',label:'Exploded axonometric',caption:'Systems separated by layer.',aspect:'wide',r:1.29},
    {src:'v02.webp',label:'Exploded axonometric — detail',caption:'Cooling and cabling layers.',aspect:'wide',r:1.29},
    {src:'v03.webp',label:'Assembly diagram',caption:'Layer-by-layer assembly.',aspect:'wide',r:1.29},
    {src:'v04.webp',label:'Assembly diagram — second state',caption:'The same model with the envelope restored.',aspect:'wide',r:1.29},
    {src:'v05.webp',label:'Plan',caption:'Dimensioned plan of the enclosure.',aspect:'plan',r:1.29},
    {src:'v06.webp',label:'Elevation',caption:'Long elevation with plant positions.',aspect:'plan',r:1.29}
  ]
},
{
  slug:'two-level-facility',
  kind:'Retrofit', deliver:['Proposal', 'Drawings', 'Renders'],
  proposal:{pages:9, ratio:1.4140},
  status:'ISSUED FOR CONSTRUCTION', discipline:'Telecom infrastructure',
  groups:[
    ['Plans',['v10.webp','v11.webp']],
    ['Zoning & coordination',['v12.webp','v13.webp']],
    ['Detail',['v14.webp']]
  ],
  title:'Two-Level Facility',
  kicker:'One organisational rule, repeated across two floors',
  category:'Data Center Design', year:'2026', tier:'featured',
  summary:'Two documented hall levels inside one building envelope — a twelve-cabinet central pod with 1.20 m contained cold aisle, four in-room cooling bays and a ten-position perimeter row.',
  role:'Architectural design · rack layout · zoning · sheet production',
  credit:'Part of a three-person design team',
  tools:['Revit','AutoCAD','Enscape','InDesign'],
  type:'Telecommunications infrastructure — two floors',
  timeline:'Architectural sheet set, August 2026',
  cover:{src:'v15.webp',label:'Data hall',aspect:'wide',r:2.46},
  facts:[['Upper level envelope','14.63 × 14.38 m — active design development'],
         ['Lower level envelope','14.63 × 12.29 m — existing, carried as reference'],
         ['Column grid','5 lines, bays 3.00–3.18 m'],
         ['Upper level','Central pod of 12 cabinets · 4 in-room cooling bays · 10-position perimeter row'],
         ['Lower level','Two rows of six cabinets · 3 in-room cooling bays at 20 ton each'],
         ['Contained cold aisle','1.20 m, repeated on both floors']],
  overview:'Two hall levels within the same building envelope — a repeating structural bay of roughly 3.0–3.2 m across a five-line column grid, repeated on both floors. Each floor organises its cabinets and in-room cooling around contained cold-aisle pairs, coordinated directly to the structural grid and access-floor tiling.',
  challenge:'Making one organisational rule work across two floors of different depth, so that pod, cooling bays and circulation all resolve against the same column grid and the same access-floor module rather than each floor being planned from scratch.',
  approach:'Zoning drives the plan: every zone reads directly off the structural grid, so nothing has a position that has to be explained. A restrained material base — white raised flooring, grey suspended ceiling, black cabinetry — with colour used as function, not decoration: one colour marks IT equipment, another marks in-room cooling, consistently across both floors. Structural columns are left exposed within the hall.',
  solution:'One repeating unit — a contained cold-aisle pair with its cooling bay — set out on the grid and simply repeated. The upper level develops it fully around a twelve-cabinet central pod; the lower level keeps its existing arrangement and is documented as reference.',
  learned:'Drawing the zoning diagram before the rack layout, rather than after, made the layout almost self-evident. Tying the colour logic to function meant the same drawings worked for the client presentation and for the engineers.',
  gallery:[
    {src:'v14.webp',label:'Containment detail',caption:'Containment at the end of a cabinet row.',aspect:'wide',r:1.35},
    {src:'v10.webp',label:'Plan — level one',caption:'Cabinet rows set out on the raised-floor grid with dimensioned clearances.',aspect:'plan',r:0.94},
    {src:'v11.webp',label:'Plan — level two',caption:'Second level layout.',aspect:'plan',r:0.99},
    {src:'v12.webp',label:'Zoning diagram',caption:'IT space, support, plant and circulation.',aspect:'plan',r:2.35},
    {src:'v13.webp',label:'Setting-out grid',caption:'The grid used across the whole sheet set.',aspect:'plan',r:1.02}
  ]
},
{
  slug:'technical-level-48-racks',
  kind:'Retrofit', deliver:['Proposal', 'Drawings'],
  proposal:{pages:19, ratio:1.4140},
  status:'DESIGN PROPOSAL', discipline:'Technical level',
  groups:[
    ['Axonometric sequence',['v16.webp','v17.webp','v18.webp']],
    ['Plans',['v19.webp','v20.webp']],
    ['Detail',['v21.webp']]
  ],
  title:'Technical Level, 48 Racks',
  kicker:'A drawing set is an argument, not an archive',
  category:'Data Center Design', year:'2026', tier:'featured',
  summary:'One technical level of 16.60 × 29.67 m holding two contained technical rooms, 48 racks and eight 20-ton cooling units, explained across a sequence of axonometrics that add one layer at a time.',
  role:'Architectural design · technical layout · proposal production',
  tools:['Revit','AutoCAD','Enscape','InDesign'],
  type:'Technical equipment facility — one level',
  timeline:'Proposal issued 26 August 2026',
  cover:{src:'v22.webp',label:'Long axonometric',aspect:'wide',r:1.86},
  facts:[['Plate dimensions','16.60 × 29.67 m'],['Technical rooms','2, both with contained aisles'],
         ['Racks','48'],['Cooling units','8 × 20 ton'],['Levels documented','1']],
  overview:'A single technical level organised as a western technical strip containing both rack rooms and all cooling plant, alongside one open raised-floor hall and an existing air-handling room.',
  challenge:'The proposal had to be read and approved by people who do not read technical drawings, without simplifying the content to the point of being useless to the engineers who would build it.',
  approach:'Four axonometrics in sequence — the whole length, the interior, the shell alone, then a close view. Each adds exactly one layer of information, from a consistent viewing angle so the eye never has to reorient. Every value in the document is marked as observed, documented or scaled, so a reader can tell a printed dimension from a measured one.',
  solution:'A layered drawing sequence that works as both client narrative and technical reference — the same geometry filtered four ways, rather than two separate sets to keep in sync.',
  learned:'Deciding what each image is allowed to say — and what it must leave out — did more for the proposal than any amount of added detail would have.',
  gallery:[
    {src:'v16.webp',label:'Axonometric — interior',caption:'Interior with the enclosure removed.',aspect:'wide',r:1.50},
    {src:'v17.webp',label:'Axonometric — shell',caption:'Shell and structure only.',aspect:'wide',r:1.66},
    {src:'v18.webp',label:'Axonometric — detail',caption:'Close view of a cabinet row and its containment.',aspect:'wide',r:1.43},
    {src:'v21.webp',label:'Aisle view',caption:'Along the service aisle.',aspect:'wide',r:0.62},
    {src:'v19.webp',label:'Floor plan',caption:'Dimensioned floor plan.',aspect:'plan',r:0.55},
    {src:'v20.webp',label:'Key plan',caption:'Locating the halls within the level.',aspect:'plan',r:0.52}
  ]
},
{
  slug:'rack-room-reorganisation',
  kind:'Retrofit', deliver:['Proposal', 'Drawings', 'Renders'],
  proposal:{pages:14, ratio:1.4129},
  status:'ISSUED', discipline:'Rack room design',
  groups:[
    ['Before and after',['v23.webp','v24.webp','v25.webp']],
    ['Issued drawing',['v26.webp']]
  ],
  title:'Rack Room Reorganisation',
  kicker:'Before and after, from the same viewpoint',
  category:'Data Center Design', year:'2024', tier:'featured',
  summary:'Reorganisation of an existing room into a structured, fully populated 24-rack hall — documented as a before-and-after pair of axonometrics and an issued reflected ceiling plan.',
  role:'Design · rack layout · technical drawing',
  credit:'Design credited to me on the issued drawing',
  tools:['Revit','AutoCAD'],
  type:'Rack room design & layout within an existing room',
  timeline:'Drawing A1.01 issued May 2024',
  cover:{src:'v27.webp',label:'Rendered view of the reorganised hall',aspect:'wide',r:1.78},
  facts:[['Racks','24 — two rows of 12'],['Aisle system','Cold aisle with contained access'],
         ['Access path','1.20 m clearance along the rack rows'],['Issued drawing','Reflected ceiling plan, scale 1:50']],
  overview:'An existing room converted into a dedicated data hall. The work centred on the layout and organisation of racks within the existing shell — establishing a logical equipment arrangement, making efficient use of the available floor area, and producing a technical, execution-ready layout that could be handed over for implementation.',
  challenge:'The room existed and was in use. Everything had to be resolved inside it: an orderly, disciplined equipment arrangement, clear access and circulation throughout, provision for maintenance and servicing, and coordination between installed equipment and the architectural shell.',
  approach:'Existing condition captured as an axonometric first, then the proposal drawn from exactly the same viewpoint, so the change reads without explanation. The layout was then issued as a properly titled technical drawing rather than a presentation image.',
  solution:'Twenty-four racks in two parallel rows of twelve, positioned back-to-back around a shared aisle with cooling units at both flanks, and 1.20 m maintained along the rows for servicing and circulation.',
  learned:'Drawing the existing condition properly — not as a sketch, but at the same quality as the proposal — is what made the improvement arguable rather than merely asserted.',
  gallery:[
    {src:'v23.webp',label:'Existing condition',caption:'The room as found, drawn from the reference viewpoint.',aspect:'wide',r:1.29},
    {src:'v24.webp',label:'Proposed arrangement',caption:'The proposed arrangement from the same reference viewpoint.',aspect:'wide',r:1.29},
    {src:'v25.webp',label:'Proposed — alternative view',caption:'The proposed arrangement from a second angle.',aspect:'wide',r:1.29},
    {src:'v26.webp',label:'Reflected ceiling plan',caption:'Drawing A1.01 — reflected ceiling plan of the rack room at 1:50, with ceiling tile, lighting and electrical panel legend.',aspect:'plan',r:1.50}
  ]
},
{
  slug:'existing-hall-conversion',
  kind:'Retrofit', deliver:['Proposal','Drawings','Renders'],
  proposal:{pages:25, ratio:0.7071},
  status:'DESIGN PROPOSAL', discipline:'Data hall conversion',
  title:'Existing Hall Conversion',
  kicker:'A layout reconciled against a geometry that is already fixed',
  category:'Data Center Design', year:'2026', tier:'featured',
  summary:'Conversion of an existing single-storey hall into an operational data center space — one contained pod of 24 rack positions resolved against a fixed column grid, documented in a proposal that separates what is established from what is still open.',
  role:'Space planning · rack & equipment layout · clearance and HVAC / electrical space coordination · Revit model · visualisation · proposal',
  tools:['Revit'],
  challenge:'Working within an existing shell places the design problem where the constraints are: fixed column positions, fixed clear dimensions, an existing glazed perimeter, an existing floor build-up, and support rooms and a stair core that cannot be relocated.',
  cover:{src:'v28.webp',label:'Proposed arrangement — axonometric',aspect:'plan'},
  facts:[['Overall dimension','27.33 m on the lower grid line'],['Rack positions','24 — two rows of 12'],
         ['Contained aisle','1.20 m clear width'],['Hall area','≈ 131 m² — derived, to be verified']],
  gallery:[]
},
{
  slug:'the-last-shadow-of-time',
  kind:'Museum', deliver:['Drawings', 'Renders'],
  status:'DESIGN PROJECT', discipline:'Cultural',
  groups:[
    ['Exterior',['v29.webp','v30.webp']],
    ['Interior',['v31.webp','v32.webp','v33.webp']],
    ['Plans, elevations & section',['v34.webp','v35.webp','v36.webp','v37.webp','v38.webp']],
    ['Massing & envelope',['v39.webp','v40.webp']],
    ['Presentation boards',['v41.webp','v42.webp']]
  ],
  title:'The Last Shadow of Time',
  kicker:'Where light completes itself in shadow',
  category:'Architecture', year:'2026', tier:'featured',
  summary:'A museum of memory, time and light, organised on a radial axis around a central void — carried from concept and massing through plans, sections, façade system and full visualisation.',
  role:'Architectural design · 3D modelling · visualisation · presentation',
  credit:'Design project, presented with academic supervision',
  tools:['Revit','Enscape','3ds Max','Photoshop','InDesign'],
  type:'Museum — architectural design project',
  timeline:'Presented 2026',
  cover:{src:'v43.webp',label:'Aerial view',aspect:'wide',r:1.96},
  facts:[['Organisation','Radial axis system around a central void'],
         ['Façade','Vertical fins, rotated along a continuous surface'],
         ['Sections','A–A and B–B at 1:200'],
         ['Presentation','Two boards — concept, plans, sections, façade, visualisation']],
  overview:'A museum exploring the relationship between human history, memory and spatial experience — designed as a place where visitors do not simply observe history but move through it. The main concept treats time as a continuous flow: curved geometry and a radial organisation create a dynamic circulation path leading visitors through different periods while keeping a constant visual connection to the central void, the symbolic core of the building.',
  challenge:'Holding a single formal idea across every scale, from the site arrangement down to the façade fin spacing, without the idea either dissolving into detail or forcing the plan into something unusable.',
  approach:'The façade skin is generated from the building geometry itself: vertical lines, rotated, swept into a surface, resolved as a façade. Vertical fins control daylight penetration while creating rhythm and depth, and the envelope acts as a climatic filter balancing transparency, shading and identity. A single fin module, repeated and rotated, keeps the façade coherent even where the geometry changes direction.',
  solution:'One radial organisation, carried consistently from the site arrangement to the fin detail — which is why the aerial, the section and the façade all read as the same building rather than three related ones.',
  learned:'A strong single idea is only worth having if it survives contact with the plan. Most of the work was not inventing the geometry — it was refusing to compromise it while making the building work.',
  gallery:[
    {src:'v29.webp',label:'Approach',caption:'From the plaza.',aspect:'wide',r:1.64},
    {src:'v31.webp',label:'Colonnade',caption:'The fin colonnade along the glazed face.',aspect:'wide',r:1.41},
    {src:'v32.webp',label:'Main hall',caption:'Interior of the main hall.',aspect:'wide',r:1.50},
    {src:'v30.webp',label:'Plaza',caption:'Public plaza at the entrance.',aspect:'wide',r:1.66},
    {src:'v33.webp',label:'Café',caption:'At the end of the loop.',aspect:'wide',r:1.52},
    {src:'v39.webp',label:'Exploded assembly',caption:'Structure, envelope and roof separated.',aspect:'plan',r:2.15},
    {src:'v40.webp',label:'Massing rotation',caption:'Massing studied in rotation.',aspect:'plan',r:1.19},
    {src:'v36.webp',label:'East elevation',aspect:'plan',r:3.31},
    {src:'v37.webp',label:'North elevation',aspect:'plan',r:3.04},
    {src:'v38.webp',label:'Section',caption:'Through the central void.',aspect:'plan',r:3.12},
    {src:'v34.webp',label:'Plan — level 01',aspect:'plan',r:0.61},
    {src:'v35.webp',label:'Plan — level 02',aspect:'plan',r:0.61}
  ],
  boards:{ title:'Presentation boards',
    items:[
      {src:'v41.webp',label:'Board 01',caption:'Concept, site, volumetric development, sections, plans and exterior views.',aspect:'board',r:0.70},
      {src:'v42.webp',label:'Board 02',caption:'Radial organisation, façade skin development, form sequence, elevations and interior views.',aspect:'board',r:0.70}
    ]}
},
{
  slug:'data-hall-retrofit',
  kind:'Retrofit', deliver:['Proposal', 'Drawings', 'Renders'],
  proposal:{pages:14, ratio:1.4140},
  status:'DESIGN PROPOSAL', discipline:'Fit-out',
  groups:[
    ['Plans',['v44.webp','v45.webp']],
    ['Axonometric sequence',['v46.webp','v47.webp','v48.webp']],
    ['Detail & interior',['v49.webp','v50.webp']]
  ],
  title:'Data Hall Retrofit',
  kicker:'A single contained row, read as the architecture',
  category:'Data Center Design', year:'2026', tier:'featured',
  summary:'A technical fit-out inside an existing floor plate — 24 cabinets in two facing rows, a 1.20 m contained aisle, four plant units and a glazed technical corridor.',
  role:'Architectural design · technical layout · BIM · drawing production',
  tools:['Revit','AutoCAD','IFC','Enscape'],
  type:'Data hall fit-out within an existing floor plate',
  timeline:'Design-development proposal, August 2026',
  cover:{src:'v51.webp',label:'Data hall interior',aspect:'wide',r:1.78},
  facts:[['Floor plate','24.34 m on the dimensioned axis'],['Data hall','14.58 m on the dimensioned axis'],
         ['Cabinets','24 — two facing rows of 12'],['Contained aisle','1.20 m'],['Plant units','4, paired at each row end']],
  overview:'A data hall occupying the lower portion of a single floor plate. The scope was a technical fit-out: cabinet organisation, aisle containment, cooling plant position, raised-floor coordination and the high-level services zone. The upper portion of the plate is drawn as a laid but unfitted floor and carried as reference only.',
  challenge:'Fitting a coherent, serviceable cabinet row into a shell whose column grid, slab level and riser positions were already fixed, while keeping the contained aisle, door swings and maintenance clearances within acceptable limits.',
  approach:'The proposal was written to one strict rule: every quantity stated is read from the drawings or counted from them. Where the documentation carried no figure, it was recorded as not specified rather than estimated. Capacities and equipment specifications are absent from the source material and are asserted nowhere.',
  solution:'A single continuous contained row on the long axis, plant pushed to the row ends, and a perimeter technical corridor that lets a technician reach any cabinet face without entering the contained aisle.',
  learned:'Retrofit rewards resolving the immovable constraints first. Once the grid, slab and risers were drawn accurately, the cabinet row had far fewer viable positions than it first appeared — and the right one became obvious rather than negotiated.',
  gallery:[
    {src:'v49.webp',label:'Technical corridor',caption:'Technical corridor along the glazed side, hall glazing to the left.',aspect:'wide',r:1.78},
    {src:'v46.webp',label:'Axonometric — cabinet plate',caption:'The cabinet plate with containment in place.',aspect:'wide',r:1.33},
    {src:'v47.webp',label:'Axonometric — exposed',caption:'Enclosure removed to show equipment distribution.',aspect:'wide',r:1.10},
    {src:'v48.webp',label:'Axonometric — enclosure',caption:'Enclosure and containment built up around the cabinets.',aspect:'wide',r:1.02},
    {src:'v50.webp',label:'Contained aisle',caption:'Looking along the contained aisle between the rows.',aspect:'wide',r:0.63},
    {src:'v45.webp',label:'Hall plan',caption:'Hall plan with dimensioned clearances.',aspect:'plan',r:0.54},
    {src:'v44.webp',label:'Cabinet plate plan',caption:'Cabinet plate set out against the structural grid.',aspect:'plan',r:0.55}
  ]
},
{
  slug:'tennis-volleyball-complex',
  kind:'Sports', deliver:['Drawings', 'Renders'],
  status:'DESIGN PROJECT', discipline:'Sports & recreation',
  model:'obj-tennis-volleyball-complex',
  groups:[
    ['Views',['tv-01.webp','tv-02.webp']],
    ['Site plan & sections',['tv-04.webp','tv-03.webp','tv-05.webp','tv-06.webp']],
    ['Presentation sheets',['tv-b1.webp','tv-b2.webp','tv-b3.webp']]
  ],
  title:'Outdoor Tennis & Volleyball Complex',
  kicker:'Two courts set into a sloping site',
  category:'Architecture', year:'2026', tier:'featured',
  summary:'An open-air tennis and volleyball complex on a 60 × 100 m site that rises four metres from south to north — both courts sunk into the slope, spectators arriving from the high side and players from the low side.',
  role:'Site planning · 3D modelling · drawings · presentation',
  tools:['3D model (Three.js)','OBJ / GLB'],
  type:'Outdoor sports complex — architectural design project',
  cover:{src:'tv-01.webp',label:'Aerial from the south-east',aspect:'wide',r:1.48},
  facts:[['Site','60 × 100 m — natural fall of 4 %, south ±0.00 to north +4.00'],
         ['Volleyball court','−1.05 — spectator concourse at +1.65'],
         ['Tennis court','−0.45 — spectator concourse at +2.25'],
         ['Stands','Four rows — front row 1.57 m above the court'],
         ['Entrances','Spectators from the north — players and service from the south'],
         ['Drawings','Site plan 1:400 · sections 1:250 and 1:150 — A3']],
  overview:'An open-air complex for tennis and volleyball on a gently sloping site. Rather than levelling the ground, the two courts are set into it at different depths, so the slope itself gives the stands their rake and separates the people who come to watch from the people who come to play.',
  challenge:'A four-metre fall across the site, two courts at different depths, and two groups of users — spectators and players — who need their own routes and should not cross.',
  approach:'Spectators enter from the higher north side and walk along paved concourses at the top of the stands, stepping down four rows towards each court. Players and service enter from the lower south side, where the lockers sit at +0.05, and reach the court floors by ramps. The scheme was built as one 3D model first; the site plan, both sections and every view on the sheets are taken from that model.',
  solution:'Two sunken court bowls tied together by a spectator link above and a player plaza below — the site’s own slope does the work of the terracing, and the two circulation systems stay apart from gate to court.',
  gallery:[
    {src:'tv-01.webp',label:'Aerial — south-east',caption:'Volleyball court in the foreground, tennis beyond.',aspect:'wide',r:1.48},
    {src:'tv-02.webp',label:'Aerial — south-west',caption:'The player approach along the western edge.',aspect:'wide',r:1.48},
    {src:'tv-03.webp',label:'Top view',caption:'The whole site from above, north to the top.',aspect:'plan',r:0.64},
    {src:'tv-04.webp',label:'Site plan',caption:'Site plan, 1:400 at A3.',aspect:'plan',r:0.64},
    {src:'tv-05.webp',label:'Section A–A',caption:'Longitudinal, south to north, through both courts — 1:250.',aspect:'plan',r:5.42},
    {src:'tv-06.webp',label:'Section B–B',caption:'Transverse, west to east, through the tennis court — 1:150.',aspect:'plan',r:3.43}
  ],
  boards:{ title:'Presentation sheets',
    items:[
      {src:'tv-b1.webp',label:'Sheet 01',caption:'Site plan.',aspect:'board',r:1.41},
      {src:'tv-b2.webp',label:'Sheet 02',caption:'Architectural sections.',aspect:'board',r:1.41},
      {src:'tv-b3.webp',label:'Sheet 03',caption:'3D isometric study.',aspect:'board',r:1.41}
    ]}
},
{
  slug:'ramsar-urban-baseline-study',
  kind:'Urban study', deliver:['Proposal'],
  proposal:{pages:38, ratio:1.7778, label:'Site-analysis presentation', tag:'Study'},
  status:'ACADEMIC STUDY', discipline:'Urban planning',
  title:'Ramsar Urban Baseline Study',
  category:'Urban Planning', year:'2026', tier:'featured',
  summary:'A baseline and site-analysis study of Ramsar on the Caspian coast — population, climate, terrain, hazards, land cover, movement and tourism, read from official data and GIS layers and carried through to a coast-to-summit synthesis and six site principles.',
  challenge:'Building a reliable picture of a coastal city when a third of the data needed was not available — and showing the gaps openly instead of filling them with guesses.',
  role:'Research · GIS mapping · analysis · presentation',
  tools:['GIS','Excel'],
  cover:{src:'cv-ramsar2.webp',label:'Hypsometry and hillshade of Ramsar county',aspect:'wide',r:1.45},
  facts:[['City population','35,997 — 1395 census'],
         ['Elevation range','−29 → 3,461 m within 36 km'],
         ['Climate','16.6 °C · 1,238 mm a year · Köppen Cfa'],
         ['Package','38 slides · 77-page report · 15 GIS maps']]
}
];


let OBJECT_TYPES = ['3D / BIM','Web component'];
let objects = [
{ title:'Tennis & Volleyball Complex — site model', type:'3D / BIM',
  file:'obj-tennis-volleyball-complex',
  description:'The whole 60 × 100 m sloping site modelled to its levels — sunken courts, stands, ramps, planting and lighting. Orbit, zoom and OBJ / GLB export.' },
{ title:'Server Rack 800 × 1200 × 2040', type:'3D / BIM',
  file:'obj-server-rack-800x1200x2040',
  description:'Interactive 42U data-center rack modelled 1:1 — standard views, 120° doors, exploded assembly, three detail levels, OBJ / GLB export.' },
{ title:'Open-type Diesel Genset', type:'3D / BIM',
  file:'obj-open-genset',
  description:'Open-frame standby generator set modelled 1:1 — orbit, zoom and OBJ / GLB export.' },
{ title:'Power Transformer 2000 kVA', type:'3D / BIM',
  file:'obj-power-transformer-2000kva',
  description:'Oil-immersed, conservator-type transformer, 3000 × 1800 × 2300 mm at LOD 300–350 — exploded assembly and OBJ / GLB export.' },
{ title:'UPS Battery Cabinet', type:'3D / BIM',
  file:'obj-ups-battery-cabinet',
  description:'1000 × 900 × 2000 mm cabinet holding 40 × 12 V 100 Ah batteries on five trays — doors-open, internal and section views, OBJ / GLB export.' },
];



/* ── Home: featured stage (image, ruler and swatches sampled from each render) ── */
let FEATURED = [{"slug": "data-hall-retrofit", "tab": "Data hall", "img": "v51.webp", "thumb": "v46.webp", "ruler": "24.34 m", "palName": "Sampled from the render", "sheet": "DATA HALL", "rows": [["CABINETS", "24"], ["AISLE", "1.20 m"]], "pal": ["#090908", "#1e1e1c", "#4c4b49", "#d8d3d2"]}, {"slug": "the-last-shadow-of-time", "tab": "Museum", "img": "mu-plaza.webp", "thumb": "v43.webp", "ruler": "1 : 200", "palName": "Sampled from the render", "sheet": "SECTION A–A", "rows": [["SCALE", "1 : 200"], ["STATUS", "DESIGN PROJECT"]], "pal": ["#0e1208", "#716a61", "#aa9c8e", "#b3bcc6"], "pos": "72% 50%"}, {"slug": "tennis-volleyball-complex", "tab": "Sports complex", "img": "tv-01.webp", "thumb": "tv-03.webp", "ruler": "60.00 m", "palName": "Sampled from the model", "sheet": "SHEET 01", "rows": [["SCALE", "1 : 400"], ["FALL", "4 %"]], "pal": ["#393d2f", "#6f715a", "#b9b3a1", "#ffffff"]}];
let HOME_PICKS = ['modular-data-centre','ramsar-urban-baseline-study','two-level-facility','rack-room-reorganisation'];

/* ── Contact ── */
let CONTACT = { phone:'09934348489', phoneHref:'tel:+989934348489', tg:'@aminetun', tgHref:'https://t.me/aminetun' };
let REQ_TYPES=['Data hall layout','Existing-hall conversion','BIM & documentation','Architectural design','Visualisation','Presentation & portfolio','Something else'];
let REQ_TIMES=['Within a week','2–4 weeks','1–3 months','Flexible'];

/* ── Hero: the specialties listed under the name ── */
let SPECIALTIES = ['Data center planning','BIM','Technical documentation','3D visualisation','Architectural design'];

/* ── Data-center systems shown in the interactive hero scene (geometry lives in js/dc-scene.js).
      `obj` links a system to its 3D model in `objects`. ── */
let DC_SYSTEMS = [
  {k:'tr',  n:'Transformer', obj:'obj-power-transformer-2000kva',
   t:'Steps the utility supply down to the building voltage. Everything in the hall starts here.',
   sp:[['Rating','2000 kVA'],['Type','Oil-immersed, conservator'],['Size','3000 × 1800 × 2300 mm']]},
  {k:'gen', n:'Standby generator', obj:'obj-open-genset',
   t:'Starts automatically when the grid fails and carries the whole load until power returns.',
   sp:[['Role','Standby power'],['Start','Automatic, on grid failure'],['Feeds','UPS and cooling']]},
  {k:'ups', n:'UPS',
   t:'Double-conversion UPS: the IT load always runs on clean, conditioned power, and never drops while the generator starts.',
   sp:[['Topology','Online double-conversion'],['Modules','Hot-swappable power modules'],['Feeds','PDUs, over the cable tray']]},
  {k:'bat', n:'Battery cabinet', obj:'obj-ups-battery-cabinet',
   t:'The energy store behind the UPS — it bridges the seconds between a grid failure and the generator taking over.',
   sp:[['Size','1000 × 900 × 2000 mm'],['Batteries','40 × 12 V 100 Ah'],['Layout','Five trays of eight']]},
  {k:'pdu', n:'Power distribution',
   t:'Splits UPS power into metered circuits and sends one to every cabinet along the overhead tray.',
   sp:[['Per row','One PDU at the row end'],['Circuits','Metered, per cabinet'],['Route','Overhead cable tray']]},
  {k:'rk',  n:'Server racks', obj:'obj-server-rack-800x1200x2040',
   t:'Sixteen 42U cabinets in two facing rows. Servers take cold air in at the front and push hot air out at the back.',
   sp:[['Cabinet','800 × 1200 × 2040 mm'],['Capacity','42U each'],['Airflow','Front to back']]},
  {k:'ca',  n:'Cold-aisle containment',
   t:'Doors and a glazed roof close the aisle between the rows, so cold supply air and hot exhaust never mix.',
   sp:[['Aisle width','1.20 m'],['Enclosure','End doors and roof panels'],['Floor','Perforated tiles']]},
  {k:'cr',  n:'Cooling units',
   t:'Push cold air under the raised floor into the contained aisle, then draw the hot air back from above the racks.',
   sp:[['Units','Two, N+1'],['Supply','Under the raised floor'],['Return','Hot air from the ceiling void']]}
];

/* ── Navigation ── */
let NAV = [
  {label:'Work', route:'work', children:[{label:'My projects', route:'work'},{label:'Object design', route:'objects'}]},
  {label:'About', route:'about'},
  {label:'Services', route:'services'},
  {label:'Process', route:'process'},
  {label:'Contact', route:'contact'}
];

/* ── Content registry ────────────────────────────────────────────────────
   The admin editor reads a snapshot with getContent() and applies published
   edits with setContent(). Keys missing from an edit keep their defaults. */
const CONTENT_SECTIONS = ['SITE','profile','SPECIALTIES','home','projects','FEATURED','HOME_PICKS','objects','OBJECT_TYPES','DC_SYSTEMS',
  'services','processPhases','skillGroups','experience','freelanceNote','CONTACT','REQ_TYPES','REQ_TIMES','CATEGORIES','NAV'];
function getContent(){
  return JSON.parse(JSON.stringify({SITE, profile, SPECIALTIES, home, projects, FEATURED, HOME_PICKS, objects, OBJECT_TYPES, DC_SYSTEMS,
    services, processPhases, skillGroups, experience, freelanceNote, CONTACT, REQ_TYPES, REQ_TIMES, CATEGORIES, NAV}));
}
function setContent(c){
  if(!c || typeof c !== 'object') return;
  const has = k => Object.prototype.hasOwnProperty.call(c, k) && c[k] !== null && c[k] !== undefined;
  if(has('SITE')) SITE = c.SITE;                 if(has('profile')) profile = c.profile;
  if(has('SPECIALTIES')) SPECIALTIES = c.SPECIALTIES; if(has('home')) home = c.home;
  if(has('projects')) projects = c.projects;     if(has('FEATURED')) FEATURED = c.FEATURED;
  if(has('HOME_PICKS')) HOME_PICKS = c.HOME_PICKS; if(has('objects')) objects = c.objects;
  if(has('OBJECT_TYPES')) OBJECT_TYPES = c.OBJECT_TYPES; if(has('DC_SYSTEMS')) DC_SYSTEMS = c.DC_SYSTEMS;
  if(has('services')) services = c.services;     if(has('processPhases')) processPhases = c.processPhases;
  if(has('skillGroups')) skillGroups = c.skillGroups; if(has('experience')) experience = c.experience;
  if(has('freelanceNote')) freelanceNote = c.freelanceNote; if(has('CONTACT')) CONTACT = c.CONTACT;
  if(has('REQ_TYPES')) REQ_TYPES = c.REQ_TYPES;   if(has('REQ_TIMES')) REQ_TIMES = c.REQ_TIMES;
  if(has('CATEGORIES')) CATEGORIES = c.CATEGORIES; if(has('NAV')) NAV = c.NAV;
}
