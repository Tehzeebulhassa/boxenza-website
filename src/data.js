// Catalogue data. Edit products, industries and services here.
  var CATS = [
    {"s":"folding-cartons","n":"Product Packaging","d":"Printed paperboard cartons for retail products, from cosmetics to supplements.","sh":"sleeve","tp":0,"pals":[0,2,3,4,5,6],"h":"Product Packaging","i":"Folding carton boxes for retail, food, cosmetics and more. Pick a style below; every box is made to your size, stock and print.","tabs":[["pop","Most popular"],["tuck","Tuck end & auto bottom"],["tray","Trays & sleeves"],["display","Display boxes"],["food","Food & take-out"],["shape","Special shapes"]],"specs":[["Stock","SBS or recycled paperboard, 300–400 gsm"],["Print","Digital or offset, full colour or Pantone"],["Finish","Foil, emboss, spot UV, soft-touch"],["Ships","Flat-packed"]],"st":[["FC01","Tuck End Sleeve","sleeve",["pop","tray"],"A printed sleeve that slides over a tray or the product itself."],["FC02","6 Corner Box","tray",["pop","tray"],"A glued tray with six corners for extra strength."],["FC03","Tab Lock Tuck Top","mail",["pop","tuck"],"A tuck lid with locking tabs that keep it closed."],["FC04","Double Wall Tray & Sleeve","drawer",["pop","tray"],"A sturdy double-wall tray that slides out of a printed sleeve."],["FC05","Reverse Tuck End","tuck",["pop","tuck"],"End flaps tuck in opposite directions, so the front panel stays clean."],["FC06","Tuck End Snap Lock Bottom","auto",["pop","tuck"],"A snap lock base that holds heavier products securely."],["FC07","Pillow","pillow",["pop","shape"],"A curved, one-piece box for small and light items."],["FC08","4 Corner Display Box","traydisp",["pop","display"],"A tray with a printed header panel for counter display."],["FC09","4 Corner Box","tray",["pop","tray"],"A simple tray glued at four corners."],["FC10","Double Wall Tray & Lid","lid",["pop","tray"],"A double-wall base with a separate fitted lid."],["FC11","Straight Tuck End","tuck",["pop","tuck"],"The classic carton, with both end flaps tucking the same way."],["FC12","Tuck End Auto Bottom","auto",["pop","tuck"],"A pre-glued base that pops open for fast packing."],["FC13","T Boxes","tuck",["shape"],"A T-shaped carton that stands out on the shelf."],["FC14","Header Card","flat",["display"],"A printed card that folds over a bag so it can hang on a peg."],["FC15","Side Lock Tuck Top Display Box","traydisp",["display"],"A display box with side locks and a tuck lid."],["FC16","Prism Shaped Box","tuck",["shape"],"A triangular box that catches the eye on any shelf."],["FC17","5 Panel Hanger Tuck End","tuck",["display","tuck"],"A tuck end box with a hanging panel for peg hooks."],["FC18","Bookend","mail",["shape"],"A box that opens from the side like a book."],["FC19","Full Overlap Seal End Box","auto",["tuck"],"Glued ends with fully overlapping flaps for heavy products."],["FC20","Gable Bag","bag",["food","shape"],"A paperboard carrier with a built-in handle."],["FC21","Paper Mailer","mail",["tuck"],"A paperboard mailer for light products sent by post."],["FC22","Hexagon Box","tuck",["shape"],"A six-sided box for gifts, candles and sweets."],["FC23","Auto Bottom Display Box","traydisp",["display"],"A display box with a pre-glued base that sets up in seconds."],["FC24","Flip Out Open Dispenser","disp",["display"],"A carton whose front flips open to dispense products."],["FC25","Box with Hanging & Locking Tabs","tuck",["display"],"A box with a hang tab and locking tabs for retail racks."],["FC26","Seal End Box","auto",["tuck"],"Ends glued shut for machine packing and tamper evidence."],["FC27","Gable Box","bag",["food","shape"],"A carry box with a handle on top, popular for food and gifts."],["FC28","Full Flap Auto Bottom","auto",["tuck"],"An auto bottom box with full-length flaps for added strength."],["FC29","Lock Cap Auto Bottom","auto",["tuck"],"An auto bottom box with a locking cap lid."],["FC30","Roll End Tuck Top with Dust Flaps","mail",["tuck"],"A roll-over lid with dust flaps that keep dirt out."],["FC31","Lock Cap with Double Side Wall","tray",["tray"],"Double side walls and a lock cap for a firm, strong box."],["FC32","Side Lock Cake Box","tray",["food"],"A cake box that locks at the sides without glue."],["FC33","Roll End Tray","tray",["tray"],"A tray with rolled ends for a smooth, finished edge."],["FC34","Simplex Tray","tray",["tray"],"A simple tray that folds together without glue."],["FC35","Four Corner Tray","tray",["tray"],"An open tray glued at four corners."],["FC36","Front Cut Out Display Tray","traydisp",["display","tray"],"A tray with a front cut-out that shows the product."],["FC37","Pinch Lock Tray","tray",["tray"],"A tray that locks at the corners when the walls are pinched."],["FC38","Double Glued Side Wall Tray","tray",["tray"],"Side walls glued double for extra strength."],["FC39","Double Wall Frame Tray","tray",["tray"],"A framed tray with double walls for a premium edge."],["FC40","Stripper Lock Tray","tray",["tray"],"A tray with locking tabs that assembles without glue."],["FC41","Takeout Paperboard Box","tray",["food"],"A folding box for hot or cold food to go."],["FC42","No Glue Cake Boxes","tray",["food"],"A cake box that folds together without any glue."],["FC43","Sandwich Wedge Box","tuck",["food","shape"],"A triangular box sized for sandwiches."],["FC44","Tulip Boxes","tray",["food","shape"],"A petal-top box for cupcakes and small treats."],["FC45","Sleeve","sleeve",["tray"],"A plain printed sleeve that wraps around a box or tray."],["FC46","Fries Cup","cupsleeve",["food"],"A paperboard cup for fries and snacks."],["FC47","Take Out Boxes","tray",["food"],"Classic folded take-out containers."],["FC48","Burger Boxes","lid",["food"],"A clamshell box sized for burgers."],["FC49","Cube Shaped Carrier","bag",["shape"],"A cube-shaped box with a carry handle."],["FC50","Double Wall Frame Tray & Sleeve","drawer",["tray"],"A framed double-wall tray inside a printed sleeve."],["FC51","Double Wall Frame Tray & Lid","lid",["tray"],"A framed double-wall tray with a matching lid."]]},
    {"s":"corrugated-boxes","n":"Corrugated Boxes","d":"Strong fluted board for mailer boxes and shipping cartons that survive the courier.","sh":"mail","tp":1,"pals":[1,1,0,1,3],"h":"Corrugated box styles","i":"Mailer and shipping boxes that survive the courier, printed inside, outside or both.","tabs":[["pop","Most popular"],["mailer","Mailer boxes"],["ship","Shipping boxes"],["special","Special"]],"specs":[["Board","E-flute for retail-ready, B or C-flute for shipping"],["Walls","Single or double wall"],["Print","Digital or offset, inside and outside"],["Ships","Flat-packed"]],"st":[["CB01","Roll End Tuck Front Corrugated Box","mail",["pop","mailer"],"The everyday mailer, with a roll end and a tuck front."],["CB02","One Piece Corrugated Mailer Box","mail",["pop","mailer"],"A one-piece mailer that folds into a strong box."],["CB03","Corrugated Slotted Container","rsc",["pop","ship"],"The standard shipping box, with flaps that meet in the middle."],["CB04","Pizza Box","tray",["pop","special"],"A flat, wide box for pizza and other flat products."],["CB05","Corrugated Box with Insert","insert",["pop","special"],"A shipping box with a fitted insert that holds the product."],["CB06","Tuck Top Auto Bottom","auto",["pop","ship"],"A tuck lid with a pre-glued auto bottom."],["CB07","Tuck Top 1-2-3 Bottom","mail",["ship"],"A tuck top with a 1-2-3 lock bottom that needs no tape."],["CB08","Corrugated Reverse Tuck End","tuck",["mailer"],"A reverse tuck end box made in sturdy corrugated board."],["CB09","1-2-3 Bottom Slotted Container","rsc",["ship"],"A slotted shipper with a quick-lock bottom."],["CB10","Corrugated Book Wrap Mailers","flatp",["mailer"],"A wrap-around mailer for books and flat items."],["CB11","Tab Lock Roll End Corrugated Box","mail",["mailer"],"A roll end mailer with tab locks."],["CB12","Self Locking Corrugated Folder Box","flatp",["mailer"],"A folder-style box that locks without tape."],["CB13","Roll Ends with Lid","lid",["mailer"],"A roll end box with a separate lid."],["CB14","Corrugated Gusset Folder","flatp",["special"],"A folder with gussets that expands to fit thicker items."],["CB15","Auto Bottom Slotted Container","rsc",["ship"],"A slotted shipper with a pre-glued base."],["CB16","Full Slotted Container","rsc",["ship"],"Outer flaps overlap fully for extra strength."],["CB17","Roll End Tuck Top Corrugated Box","mail",["mailer"],"A roll end box with a tuck top lid."],["CB18","Corrugated Wine Carrier","wine",["special"],"A carrier that holds wine bottles upright and apart."],["CB19","Roll End 3 Flap Lock Corrugated Box","mail",["mailer"],"A roll end box that locks with three flaps."]]},
    {"s":"rigid-boxes","n":"Rigid Boxes","d":"Heavy, wrapped greyboard boxes for gifts and premium products.","sh":"lid","tp":5,"pals":[5,2,4,0],"h":"Rigid box styles","i":"Premium boxes with a heavy, high-end feel for gifts, cosmetics, electronics and keepsakes.","tabs":[["pop","Most popular"],["magnetic","Magnetic"],["lid","Lid styles"],["other","Book, slide & shapes"]],"specs":[["Board","1.5–3 mm greyboard"],["Wrap","Printed or textured paper"],["Finish","Foil, emboss, ribbon, magnets"],["Ships","Assembled or collapsible"]],"st":[["RB01","Magnetic Closure Boxes","mail",["pop","magnetic"],"A hinged lid that closes with hidden magnets."],["RB02","Lift-Off / Detachable Lid","lid",["pop","lid"],"A separate lid that lifts off the base."],["RB03","Collapsible / Foldable","gift",["pop","other"],"Ships flat and folds up into a rigid box."],["RB04","Book Style Rigid Box","mail",["pop","other"],"Opens like a book on a spine hinge."],["RB05","Match / Slide Style","drawer",["pop","other"],"A tray that slides out of a rigid sleeve."],["RB06","Flip Top Magnetic Lock","mail",["magnetic"],"A flip-top lid held shut by a magnet."],["RB07","Partial Cover","lid",["lid"],"A lid that covers part of the base for a two-tone look."],["RB08","Shoulder / Neck","lid",["lid"],"A lid that rests on a raised inner neck."],["RB09","Hinged / Flip Lid","mail",["lid"],"A lid joined to the base along one edge."],["RB10","Round Shaped","tin",["other"],"A cylinder-shaped rigid box with a lid."],["RB11","Custom Shape","gift",["other"],"A rigid box made in the shape you need."]]},
    {"s":"box-inserts","n":"Box Inserts","d":"Die-cut inserts that hold each item in place inside the box.","sh":"insert","tp":1,"pals":[1,5,0,6],"h":"Box insert styles","i":"Die-cut inserts that hold each item in place and make opening the box feel deliberate.","tabs":[["pop","All inserts"]],"specs":[["Materials","Corrugated, paperboard, foam, moulded pulp"],["Cut","Die-cut to your product"],["Fit","Made to your box size"],["Ships","Flat or nested"]],"st":[["BI01","Foam Inserts","insert",["pop"],"Precision-cut foam that cushions fragile products."],["BI02","Cardboard Inserts","insert",["pop"],"Die-cut paperboard or corrugated that holds each item in place."],["BI03","Plastic Tray Inserts","insert",["pop"],"Formed plastic trays shaped around the product."],["BI04","Molded Pulp Inserts","insert",["pop"],"Moulded paper pulp that protects without plastic."]]},
    {"s":"paper-bags","n":"Paper Shopping Bags","d":"Branded paper carrier bags in kraft, white or full colour.","sh":"bag","tp":3,"pals":[1,0,3,5,4,6,2],"h":"Paper shopping bag styles","i":"Carrier bags in kraft, white or fully printed paper, with twisted-paper, rope or ribbon handles.","tabs":[["pop","Most popular"],["lux","Luxury"],["kraft","Kraft & everyday"],["other","Bottle bags & tags"]],"specs":[["Paper","Kraft or coated art paper, 120–210 gsm"],["Handles","Twisted paper, rope or ribbon"],["Print","Digital or offset, full colour"],["Finish","Foil, emboss, soft-touch"]],"st":[["PB01","Euro Tote Bags","bag",["pop","lux"],"A rigid, glossy bag with a reinforced top."],["PB02","Kraft Paper Bags","bag",["pop","kraft"],"Everyday carrier bags in natural or white kraft."],["PB03","Die Cut Bags","sos",["pop","kraft"],"The handle is cut into the bag itself."],["PB04","Gift Bags","bag",["pop","lux"],"Compact bags with ribbon or rope handles for gifting."],["PB05","Wide Gusset Paper Bags","bagw",["kraft"],"A broad base for boxes, clothing and bulky items."],["PB06","Paper Merchandise Bags","bagw",["lux"],"Mid-size retail bags for apparel and accessories."],["PB07","SOS Bags","sos",["kraft"],"Flat-bottom bags without handles for bakery and take-away."],["PB08","Paper Liquor & Wine Bags","wine",["other"],"Tall, narrow bags for one or two bottles."],["PB09","White Paper Bags","bag",["lux"],"Clean white bags that show off colour print."],["PB10","Paper Carrier Bags","bag",["kraft"],"Strong carrier bags for everyday shopping."],["PB11","Custom Paper Bag Tags","labels",["other"],"Printed tags that hang from the bag handle."]]},
    {"s":"reusable-bags","n":"Reusable Shopping Bags","d":"Fabric bags your customers carry again and again.","sh":"tote","tp":6,"pals":[6,1,0,3,4],"h":"Reusable shopping bag styles","i":"Fabric bags that customers use again and again, carrying your brand wherever they go.","tabs":[["pop","Most popular"],["wine","Wine bags"]],"specs":[["Fabric","Cotton, canvas, jute or non-woven"],["Print","Screen print or heat transfer"],["Handles","Short or long, stitched"],["Ships","Flat or folded"]],"st":[["RT01","Cotton Bag","tote",["pop"],"A classic tote in natural or dyed cotton."],["RT02","Canvas Bag","tote",["pop"],"Heavy canvas that carries more and lasts longer."],["RT03","Non-Woven Bag","tote",["pop"],"A light, low-cost bag for events and promotions."],["RT04","Woven Bag","tote",["pop"],"A tough woven polypropylene bag for heavy shopping."],["RT05","Jute Bag","tote",["pop"],"A natural fibre bag with a rustic look."],["RT06","Reusable Wine Bags","wine",["wine"],"A reusable bag sized for carrying bottles."],["RT07","Custom Wine Tote Bags","wine",["wine"],"A tote with dividers that holds several bottles."]]},
    {"s":"mailer-bags","n":"Mailer Shipping Bags","d":"Light, tough bags for shipping clothing and soft goods.","sh":"flat","tp":6,"pals":[0,1,6,3],"h":"Mailer shipping bag styles","i":"Light, tough shipping bags for apparel, books and soft goods, printed with your brand.","tabs":[["pop","All mailer bags"]],"specs":[["Material","Poly, kraft paper or compostable film"],["Closure","Peel-and-seal strip"],["Print","Up to full colour"],["Ships","Flat, in cartons"]],"st":[["MB01","Poly Shipping Mailer Bags","flat",["pop"],"Lightweight, waterproof self-seal bags for soft goods."],["MB02","Paper Shipping Mailer Bags","flat",["pop"],"Paper-based mailers with a peel-and-seal strip."],["MB03","Bubble Shipping Mailers","flatp",["pop"],"Cushioned mailers for books, cosmetics and small electronics."]]},
    {"s":"pouches","n":"Flexible Pouches","d":"Barrier pouches that keep food, coffee and dry goods fresh.","sh":"pouch","tp":4,"pals":[0,1,4,5,2,6],"h":"Flexible pouch styles","i":"Printed pouches that protect the contents, stand out on the shelf and keep products fresh.","tabs":[["pop","Most popular"],["stand","Stand-up"],["flat","Flat & bags"]],"specs":[["Material","Laminated film or kraft"],["Closure","Zip-lock, tear notch, valve"],["Print","Digital or gravure"],["Ships","Flat, in cartons"]],"st":[["PO01","Stand Up Pouches","pouch",["pop","stand"],"Pouches that stand on the shelf on their own base."],["PO02","Kraft Stand Up Pouches","pouch",["pop","stand"],"A natural kraft look with a food-safe lining."],["PO03","Flat Bottom Pouch Bag","pouch",["pop","stand"],"A boxy, premium pouch that stands firmly."],["PO04","Flat Pouches","pouch",["pop","flat"],"Flat sachet-style pouches for samples and single servings."],["PO05","Spouted Pouches","pouch",["stand"],"Pouches with a spout for liquids and sauces."],["PO06","Gusset Bags","pouch",["flat"],"Side gussets expand to hold more product."],["PO07","Tin-Tie Bags","pouch",["flat"],"Bags closed with a folding tin tie, popular for coffee and baked goods."]]},
    {"s":"corporate-packaging","n":"Corporate Packaging","d":"Branded gift boxes and kits for employees, clients and events.","sh":"gift","tp":5,"pals":[5,2,0,4,1],"h":"Corporate packaging styles","i":"Gift boxes, welcome kits and event packaging that put your company's brand in the hands of your team and your clients.","tabs":[["pop","Most popular"],["gift","Gift boxes"],["kits","Kits & mailers"],["extras","Bags, cards & extras"]],"specs":[["Boxes","Rigid or corrugated, fully printed"],["Inside","Custom inserts for every item"],["Finish","Foil logo, emboss, ribbon"],["Used for","Onboarding, client gifts, events, holidays"]],"st":[["CP01","Corporate Gift Boxes","mail",["pop","gift"],"A magnetic rigid gift box with your logo, for client and partner gifts."],["CP02","Employee Welcome Kit Box","mail",["pop","kits"],"A printed mailer box that holds a new hire's welcome items, sent to the office or to their home."],["CP03","Executive Gift Box","lid",["pop","gift"],"A heavy lift-off lid box with a foil logo for senior clients and VIP gifts."],["CP04","Holiday Gift Box","gift",["gift"],"A seasonal gift box for Eid, Christmas or year-end gifts to staff and clients."],["CP05","Event & Conference Kit","mail",["kits"],"A branded kit box for event giveaways, speaker gifts and attendee packs."],["CP06","Drawer Gift Box","drawer",["gift"],"A slide-out drawer box for pens, watches and other small premium gifts."],["CP07","Branded Gift Bags","bag",["extras"],"Printed paper bags for handing over gifts at events and meetings."],["CP08","Branded Thank-You Cards","flat",["extras"],"Printed cards with a message from the company, placed on top of the gift."],["CP09","Gift Box Inserts","insert",["extras"],"Die-cut inserts that hold every item of the kit in place."],["CP10","Presentation Folders","flatp",["extras"],"Printed folders for proposals, onboarding papers and event handouts."]]},
    {"s":"display-boxes","n":"POP Displays","d":"Counter, floor and pallet displays that sell at the point of purchase.","sh":"disp","tp":2,"pals":[3,0,2,4,5],"h":"POP display styles","i":"Counter and floor displays that put your product in front of the customer at the point of sale.","tabs":[["pop","All displays"],["floor","Floor"],["counter","Counter"]],"specs":[["Board","Printed corrugated"],["Sizes","Counter, half pallet, full pallet"],["Print","Full colour, inside and outside"],["Ships","Flat, assembled on site"]],"st":[["DB01","Counter Top Displays","disp",["pop","counter"],"Small displays that sit by the till and sell impulse products."],["DB02","Floor Displays","dispt",["pop","floor"],"Freestanding units for launches and promotions."],["DB03","Peg Hook Displays","disp",["pop","counter"],"Displays for products that hang on peg hooks."],["DB04","Dump Bin Display","disp",["pop","floor"],"Open, high-volume bins for loose products."]]},
    {"s":"labels-stickers","n":"Stickers and Labels","d":"Custom stickers, seals and labels on rolls or sheets.","sh":"labels","tp":0,"pals":[0,1,6,4],"h":"Sticker and label styles","i":"Labels, seals and stickers that finish the pack, supplied on rolls or sheets.","tabs":[["pop","Most popular"],["roll","Rolls"],["sheet","Sheets"]],"specs":[["Material","Paper, kraft or vinyl"],["Finish","Matte, gloss or foil"],["Format","Rolls or sheets"],["Adhesive","Permanent or removable"]],"st":[["LS01","Custom Stickers","labels",["pop","sheet"],"Stickers in any shape and size to brand boxes and bags."],["LS02","Custom Labels","labels",["pop","roll"],"Labels on rolls for products, jars and bottles."],["LS03","Die-Cut Stickers","labels",["sheet"],"Cut to your exact shape, from circles to logos."],["LS04","Kiss-Cut Sticker Sheets","labels",["sheet"],"Several stickers on one sheet that peel off one by one."],["LS05","Clear Labels","labels",["roll"],"Transparent labels for a no-label look on glass and plastic."],["LS06","Seal Stickers","labels",["roll"],"Small stickers that seal boxes, bags and tissue."],["LS07","Bottle Labels","labels",["roll"],"Wrap-around labels for bottles, jars and tubes."],["LS08","Hang Tags","labels",["sheet"],"Card tags with a hole for string or ribbon."]]},
    {"s":"tissue-paper","n":"Tissue Paper and Liners","d":"Printed tissue, food-safe wraps and liners for presenting products.","sh":"tissue","tp":4,"pals":[4,0,3,6,2],"h":"Tissue paper and liner styles","i":"Branded tissue for wrapping products, plus food-safe wraps and liners for bakeries, delis and restaurants.","tabs":[["pop","Most popular"],["print","Print layouts"],["liner","Food-safe liners"]],"specs":[["Paper","Tissue about 17 to 28 gsm, or food-safe greaseproof paper"],["Print","One to three colours, food-safe inks for liners"],["Size","Cut to your sheet size"],["Ships","Folded, flat sheets or interleaved"]],"st":[["TS01","Custom Printed Tissue Paper","tissue",["pop","print"],"Tissue printed with your logo or pattern for wrapping products."],["TS02","Horizontal Non-Position Printing","tissue",["pop","print"],"Your design repeats in straight rows across the sheet."],["TS03","Diagonal Non-Position Printing","tissue",["print"],"Your design repeats on a diagonal for an all-over pattern."],["TS04","Position Printing","tissue",["print"],"Your design is printed in a fixed spot on every sheet."],["TS05","Deli Wrap Paper","tissue",["liner","pop"],"A sheet for wrapping sandwiches, cheese and deli items."],["TS06","Greaseproof Paper","tissue",["liner","pop"],"Resists oil and grease so the paper does not soak through."],["TS07","Burger Wrap","tissue",["liner","pop"],"A sheet that holds a burger together and keeps it warm."],["TS08","Sandwich Wrap","tissue",["liner"],"A printed sheet sized for sandwiches and wraps."],["TS09","Basket Liner","tissue",["liner","pop"],"A printed sheet that lines baskets and trays for fries and snacks."],["TS10","Bakery Tissue","tissue",["liner"],"A light sheet for handling bread, pastries and cookies."],["TS11","Wax-Coated Sheet","tissue",["liner"],"A coated sheet that resists moisture."],["TS12","Printed Tray Liner","tissue",["liner"],"A branded sheet that fits a serving tray."],["TS13","Fries and Snack Paper","tissue",["liner"],"A small sheet for cones, cups and snack packs."],["TS14","Interleaved Deli Sheets","tissue",["liner","pop"],"Sheets stacked so one can be pulled at a time from a dispenser."]]},
    {"s":"packing-tape","n":"Packing Tape","d":"Custom printed tape to seal and brand your parcels.","sh":"tape","tp":1,"pals":[1,0,2,3,6],"h":"Packing tape styles","i":"Branded tape that seals the box and shows your logo before the box is even opened.","tabs":[["pop","Most popular"],["paper","Paper"],["plastic","Plastic"]],"specs":[["Materials","Acrylic, hot-melt or paper"],["Print","One to three colours, repeating or all-over"],["Widths","Standard widths such as 48 mm and 72 mm"],["Core","Standard tape-gun cores"]],"st":[["PT01","Custom Printed Tape","tape",["pop","plastic"],"Your logo printed along a roll of packing tape."],["PT02","Custom Printed Kraft Tape","tape",["pop","paper"],"Kraft paper tape with your print, recyclable with the box."],["PT03","Custom Printed Reinforced Kraft Tape","tape",["pop","paper"],"Kraft tape with fibre reinforcement for heavy cartons."],["PT04","Water-Activated Tape","tape",["paper"],"Paper tape that bonds to the box when wet."],["PT05","Fragile Warning Tape","tape",["plastic"],"High-visibility tape that asks handlers to take care."],["PT06","Tamper-Evident Tape","tape",["plastic"],"Shows a visible mark if the seal is opened."]]},
    {"s":"card-inserts","n":"Card Inserts","d":"Printed cards that add a personal note to every order.","sh":"flat","tp":0,"pals":[0,4,6,3,2],"h":"Card insert styles","i":"Thank-you cards, postcards and info cards that sit on top of the product and make the unboxing feel personal.","tabs":[["pop","Most popular"],["promo","Promotional"]],"specs":[["Stock","Uncoated, silk or textured card, 300 to 450 gsm"],["Print","Digital or offset, one or both sides"],["Finish","Foil, spot UV, rounded corners"],["Ships","Flat, packed in sets"]],"st":[["CI01","Custom Thank You Cards","flat",["pop"],"Printed cards that thank customers for their order."],["CI02","Custom Kraft Thank You Cards","flat",["pop"],"Thank-you cards on natural kraft card."],["CI03","Postcard Insert","flat",["pop"],"A full-colour postcard with your story or a photo."],["CI04","Discount Code Card","flat",["promo"],"A card with a code that brings customers back."],["CI05","QR Code Card","flat",["promo"],"A card with a QR code that links to a video or review page."],["CI06","Care Instructions Card","flat",["pop"],"How to use, wash or store the product."],["CI07","Gift Card Holder","flatp",["promo"],"A folded card that holds a gift card or voucher."]]},
    {"s":"eco-packaging","n":"Eco-friendly Packaging","d":"Sustainable alternatives to standard packaging.","sh":"rsc","tp":1,"pals":[1,6,0,1],"h":"Eco-friendly packaging","i":"Recycled, compostable and plastic-free options for brands that want a lighter footprint.","tabs":[["pop","Most popular"],["boxes","Boxes & inserts"],["mailers","Mailers & pouches"],["other","Bags, tissue & labels"]],"specs":[["Materials","Recycled board, kraft, pulp, plant-based film"],["Inks","Soy or water-based"],["Coatings","Aqueous"],["End of life","Recyclable or compostable, depending on style"]],"st":[["EP01","Eco Product Boxes","tuck",["pop","boxes"],"Product cartons made from recycled or FSC-certified board."],["EP02","Eco Shipping Boxes","rsc",["pop","boxes"],"Shipping boxes made from recycled corrugated board."],["EP03","Compostable Mailers","flat",["pop","mailers"],"Plant-based mailers that break down in composting."],["EP04","Eco Luxury Boxes","lid",["boxes"],"Premium rigid boxes with recycled board and paper wraps."],["EP05","Eco Box Inserts","insert",["boxes"],"Paper and pulp inserts that replace foam and plastic."],["EP06","Recycled Poly Mailers","flat",["mailers"],"Poly mailers made with recycled plastic content."],["EP07","Recycled Pouches","pouch",["mailers"],"Pouches made with recycled material content."],["EP08","Compostable Pouches","pouch",["mailers"],"Plant-based pouches for compostable food packaging."],["EP09","Eco Shopping Bags","bag",["pop","other"],"Paper and fabric bags made from recycled or natural materials."],["EP10","Recycled Tissue Paper","tissue",["other"],"Tissue made from recycled fibre with soy-based inks."],["EP11","Compostable Stickers & Labels","labels",["other"],"Labels on compostable paper and film."]]},
    {"s":"cup-sleeves","n":"Cup Sleeves","d":"Printed sleeves for hot and cold drink cups.","sh":"cupsleeve","tp":1,"pals":[1,0,3,6,4],"h":"Cup sleeve styles","i":"Printed sleeves that keep hands cool and put your brand on every takeaway cup.","tabs":[["pop","Most popular"],["hot","Hot drinks"],["eco","Eco"],["promo","Promotional"]],"specs":[["Stock","Kraft or white paperboard, or corrugated for insulation"],["Print","Digital or offset, full colour"],["Fits","Small to large paper cups, sized to your cup"],["Ships","Flat-packed"]],"st":[["CS01","Classic Cup Sleeve","cupsleeve",["pop","hot"],"A simple printed paperboard sleeve that wraps a standard hot cup."],["CS02","Kraft Cup Sleeve","cupsleeve",["pop","hot","eco"],"Natural kraft board with a one or two colour print for a café look."],["CS03","Corrugated Insulated Sleeve","cupsleeve",["pop","hot"],"A ribbed layer that keeps heat off the hand for very hot drinks."],["CS04","Recycled Paperboard Sleeve","cupsleeve",["pop","eco"],"A sleeve made from recycled board, with water-based inks."],["CS05","Full-Wrap Sleeve","cupsleeve",["pop","hot"],"Wraps most of the cup, leaving room for large artwork."],["CS06","Half-Wrap Sleeve","cupsleeve",["hot"],"A shorter band for a lighter, lower-cost look."],["CS07","Window Cut-Out Sleeve","cupsleeve",["promo"],"A cut-out that shows the cup or the drink name through the sleeve."],["CS08","Tear-Off Coupon Sleeve","cupsleeve",["promo"],"A sleeve with a perforated coupon the customer can tear off and keep."],["CS09","Seasonal Print Sleeve","cupsleeve",["promo"],"Limited-run designs for holidays, events and menu launches."],["CS10","Glue-Free Locking Sleeve","cupsleeve",["pop","eco"],"Slots together without glue, so it is easier to recycle."]]}
  ];
  var IND = [
    ["apparel","Fashion & Apparel","Mailer bags, shopping bags and boxes for clothing brands.","bag",2,["mailer-bags","paper-bags","corrugated-boxes","folding-cartons"],"Apparel packaging should be light to ship and make opening the parcel part of the brand.",[["Light and cheap to ship","Mailer bags keep dimensional weight and postage low."],["Brand the unboxing","Printed bags and stickers add a finishing touch."],["Plan for returns","Choose a mailer or box that can be resealed for easy returns."]]],
    ["bakery","Bakery & Cake","Boxes and bags for cakes, pastries and take-away.","tray",3,["folding-cartons","paper-bags","corrugated-boxes"],"Bakery packaging needs to carry delicate, sometimes greasy products and show them off.",[["Grease resistance","Coated or lined board stops grease marks showing through."],["Windows sell","A film window lets customers see the cake or pastry inside."],["Easy to carry","Handles and sturdy bases help heavier boxes travel safely."]]],
    ["beer-liquor","Beer & Liquor","Carriers, shippers and gift boxes for beer and spirits.","rsc",3,["corrugated-boxes","rigid-boxes","box-inserts","paper-bags"],"Bottles are heavy and fragile, and premium spirits are judged by the box before the bottle.",[["Protect every bottle","Dividers and inserts stop glass from knocking together in transit."],["Premium presentation","Rigid boxes with foil and emboss suit gift-grade spirits."],["Check label rules","Leave room for alcohol content, warnings and origin details your market requires."]]],
    ["beverage","Beverage","Cartons, carriers and shippers for drinks brands.","auto",2,["folding-cartons","corrugated-boxes","labels-stickers","box-inserts"],"Drinks packaging has to carry weight, resist moisture and stand out in a fridge or on a shelf.",[["Moisture matters","Coated board and the right varnish help packs survive chillers and condensation."],["Multi-packs","Carriers and sleeves bundle cans and bottles for retail."],["Label space","Plan for nutrition panels, barcodes and recycling marks."]]],
    ["candles","Candle","Strong cartons, inserts and gift boxes for candles.","tuck",5,["folding-cartons","rigid-boxes","box-inserts","corrugated-boxes"],"Candles are heavy and breakable, so the pack has to protect them and still feel like a gift.",[["Weight matters","Choose a sturdy board and a secure base for heavier jars."],["Stop movement","Inserts keep jars from knocking against each other in shipping."],["Gift-ready finish","Foil and embossing add a finishing touch."]]],
    ["candy-sweets","Candy & Sweets","Bright boxes, pouches and bags for confectionery.","pillow",3,["folding-cartons","pouches","paper-bags","display-boxes"],"Sweets packaging sells on colour and fun, and still has to meet food-contact rules.",[["Food-safe materials","Ask for food-safe inks, coatings and inner liners."],["Shelf impact","Counter displays and bold colours drive impulse buys."],["Seasonal runs","Short digital runs make holiday designs affordable."]]],
    ["cannabis","Cannabis","Compliant cartons, pouches and labels where cannabis is legal.","auto",6,["folding-cartons","pouches","mailer-bags","labels-stickers"],"Where cannabis is legal, packaging has strict rules on child resistance, labelling and appearance.",[["Know local rules","Requirements differ by country and state, so confirm what yours needs before you design."],["Child resistance","Some markets require certified child-resistant closures."],["Plain options","Some markets limit colours and imagery, so plan the design around that."]]],
    ["chocolate","Chocolate","Sleeves, gift boxes and inserts for chocolate makers.","gift",5,["folding-cartons","rigid-boxes","box-inserts","paper-bags"],"Chocolate packaging protects a delicate, heat-sensitive product and makes it feel like a treat.",[["Hold each piece","Fitted inserts keep pralines and truffles in place."],["Premium finish","Foil, emboss and soft-touch make bars and boxes feel special."],["Food contact","Use food-safe liners where chocolate touches the pack."]]],
    ["coffee","Coffee","Pouches, cartons and gift boxes for coffee roasters.","pouch",1,["pouches","folding-cartons","paper-bags","rigid-boxes"],"Coffee packaging has to keep aroma in and air out, and tell the story of the roast.",[["Valves for coffee","One-way degassing valves let gas out and keep air out."],["Gift sets","Rigid or drawer boxes suit tasting sets and subscription gifts."],["Natural look","Kraft stock suits earthy, small-batch brands."]]],
    ["cosmetics","Cosmetics","Boxes and bags that make beauty products look as good as they feel.","tuck",4,["folding-cartons","rigid-boxes","paper-bags","box-inserts"],"Cosmetics packaging has to protect fragile bottles and jars and still look premium on the shelf.",[["Protect the product","Inserts and snug folding cartons keep glass and pumps from rattling in transit."],["Make it feel premium","Soft-touch coating, foil and emboss add a luxury finish to small boxes."],["Think about shelf size","Smaller, right-sized cartons help products stand out in tight retail displays."]]],
    ["ecommerce","E-Commerce","Mailer boxes, bags and inserts for online orders.","rsc",1,["corrugated-boxes","mailer-bags","box-inserts","labels-stickers"],"E-commerce packaging has to ship well, cost little to send and make a good first impression.",[["Right-size it","Smaller boxes cut void fill and dimensional-weight charges."],["Protect on the way","Pick board strength for the weight and the courier route."],["Make unboxing a moment","Print the inside of the box and add a thank-you sticker."]]],
    ["electronics","Electronics","Protective boxes and inserts for devices and accessories.","mail",1,["corrugated-boxes","box-inserts","folding-cartons","rigid-boxes"],"Electronics packaging has to survive transit and make the product look worth its price.",[["Cushion it","Foam or moulded pulp inserts absorb knocks in transit."],["Fit exactly","Custom dimensions leave no empty space for the product to move."],["Show the specs","Leave room for icons, model numbers and compliance marks."]]],
    ["food","Food","Pouches, cartons and bags for packaged food.","pouch",0,["pouches","folding-cartons","corrugated-boxes","paper-bags"],"Food packaging protects freshness, carries your story and has to meet food-contact rules where you sell.",[["Check food contact","Ask for food-safe inks and coatings, and board approved for food contact where needed."],["Keep it fresh","Barrier pouches and zip closures protect taste and shelf life."],["Plan the label space","Leave room for ingredients, barcodes and legal text in the artwork."]]],
    ["gift","Gift","Rigid boxes, bags and tissue for gifting.","gift",4,["rigid-boxes","paper-bags","tissue-paper","card-inserts"],"Gift packaging is the first thing the recipient sees, so it should feel considered.",[["Make opening special","Magnetic lids, ribbons and tissue add to the moment."],["Add a message","A printed card insert makes the gift personal."],["Ready to give","Bags and boxes that need no extra wrapping save time."]]],
    ["jewelry","Jewelry","Rigid boxes, inserts and bags for small, valuable items.","gift",5,["rigid-boxes","folding-cartons","box-inserts","paper-bags"],"Jewelry packaging is small, careful and meant to be kept.",[["Hold it in place","Foam or card inserts stop small pieces sliding around."],["Premium touches","Rigid boxes with ribbon or magnetic closures feel like a gift."],["Small and light","Compact boxes keep shipping costs down."]]],
    ["pets","Pets","Pouches, cartons and mailers for pet food and accessories.","pouch",6,["pouches","folding-cartons","corrugated-boxes","mailer-bags"],"Pet packaging has to keep treats fresh, survive shipping and appeal to the owner.",[["Resealable pouches","Zip closures keep treats fresh after opening."],["Strong for heavy food","Choose board and film strength for the weight."],["Clear information","Leave room for feeding guides and ingredients."]]],
    ["pharmaceutical","Pharmaceutical","Cartons, labels and inserts for health products.","auto",0,["folding-cartons","labels-stickers","card-inserts","box-inserts"],"Pharmaceutical packaging carries required information and must show it has not been opened.",[["Required text","Plan space for dosage, warnings, batch and expiry details."],["Tamper evidence","Seals and glued ends show the pack is intact."],["Leaflets","Folded information leaflets fit inside the carton."]]],
    ["presentation","Presentation","Folders, rigid boxes and inserts for kits and presentations.","mail",2,["rigid-boxes","box-inserts","card-inserts","folding-cartons"],"Presentation packaging makes samples, kits and proposals look like they matter.",[["Hold every item","Custom inserts keep samples and documents in place."],["Book-style boxes","A box that opens like a book suits kits and launches."],["Brand inside and out","Print the inside of the lid for a memorable reveal."]]],
    ["restaurant","Restaurant","Take-out boxes, bags, liners and cup sleeves.","tray",3,["folding-cartons","paper-bags","tissue-paper","cup-sleeves"],"Restaurant packaging keeps food hot, holds up to grease and carries your brand out the door.",[["Grease resistance","Coated board and greaseproof liners stop oil showing through."],["Keep it warm","Choose structures that hold heat for delivery."],["Brand every order","Printed bags, sleeves and liners turn take-out into advertising."]]],
    ["retail","Retail","Shelf-ready cartons, displays and shopping bags.","disp",2,["folding-cartons","display-boxes","paper-bags","labels-stickers"],"Retail packaging has a few seconds on the shelf to catch the eye and explain the product.",[["Shelf impact","Bold front panels and displays help products get noticed."],["Retail-ready","Shelf trays and displays go straight from the box to the shelf."],["Barcodes and info","Plan space for barcodes and required labels."]]],
    ["shipping-mailer","Shipping & Mailer","Mailer boxes, shippers and bags for parcels.","mail",1,["corrugated-boxes","mailer-bags","box-inserts","packing-tape"],"Shipping packaging has to survive couriers and keep postage costs down.",[["Right-size it","Smaller boxes cut void fill and dimensional-weight charges."],["Strength for the route","Pick flute and wall strength for the weight and distance."],["Seal it with your brand","Printed tape and mailers turn every parcel into a billboard."]]],
    ["soap","Soap","Sleeves, cartons and wraps for soap and bath products.","sleeve",0,["folding-cartons","tissue-paper","labels-stickers","eco-packaging"],"Soap packaging should protect the bar, let it breathe where needed and look natural.",[["Sleeves and wraps","A printed sleeve or paper wrap shows off the bar and uses little material."],["Natural materials","Kraft and recycled board suit handmade brands."],["Ingredient labels","Leave room for ingredients and weight."]]],
    ["toy","Toy","Display boxes, cartons and inserts for toys and games.","traydisp",3,["folding-cartons","display-boxes","box-inserts","corrugated-boxes"],"Toy packaging should show the product, survive handling and meet safety labelling rules.",[["Show the toy","Windows and display boxes let children see what is inside."],["Hold the parts","Inserts keep pieces secure and easy to put back."],["Safety labels","Plan space for age warnings and safety marks."]]],
    ["tea","Tea","Pouches, cartons and gift boxes for loose tea and tea bags.","pouch",7,["pouches","folding-cartons","rigid-boxes","labels-stickers"],"Tea packaging has to keep leaves fresh and dry and suit the character of the blend.",[["Keep it fresh","Barrier pouches and lined cartons protect aroma and keep moisture out."],["Gift sets","Rigid boxes with inserts suit tasting collections."],["Natural look","Kraft and soft colours suit artisan blends."]]],
    ["window","Window","Boxes with clear windows that show the product.","traydisp",4,["folding-cartons","corrugated-boxes","rigid-boxes","display-boxes"],"Window packaging lets customers see the product before they buy, which builds trust on the shelf.",[["Frame the product","Place the window where the best part of the product shows."],["Film choice","Clear film comes in standard and plant-based options."],["Protect what shows","Inserts keep the product centred behind the window."]]],
    ["wine","Wine","Wine boxes, bottle bags and shippers.","wine",1,["rigid-boxes","paper-bags","corrugated-boxes","box-inserts"],"Wine packaging protects glass bottles and often doubles as the gift wrap.",[["Bottle protection","Inserts and dividers keep bottles from moving."],["Gift-ready","Rigid wine boxes and bottle bags suit gifting."],["Ship safely","Corrugated shippers with cells survive courier handling."]]],
    ["automotive","Automotive","Strong cartons and inserts for parts and accessories.","rsc",7,["corrugated-boxes","box-inserts","labels-stickers","folding-cartons"],"Automotive packaging has to carry heavy, oddly shaped parts without damage.",[["Heavy-duty board","Double-wall corrugated handles weight and long routes."],["Fit the part","Custom foam or corrugated inserts hold each part still."],["Clear labelling","Part numbers and barcodes speed up handling."]]],
    ["supplements","Supplements","Cartons, pouches and mailers for health products.","auto",0,["folding-cartons","pouches","box-inserts","mailer-bags"],"Supplement packaging carries a lot of required text and has to look trustworthy.",[["Space for text","Plan room for supplement facts, warnings and batch codes."],["Tamper evidence","Seals and glued ends show the pack has not been opened."],["Subscription friendly","Slim cartons and mailers suit monthly deliveries."]]]
  ];
  var SVC = [
    ["structural-design","Structure Design & Engineering","Structures designed around your product.","auto",0,"Tell us what you are packing and how it will travel. We design a structure that fits the product, protects it and keeps material use down.",[["Custom dielines","Built to your exact product dimensions."],["Fit and protection","Wall strength, inserts and closures chosen for how the box will be handled."],["Right-sizing","Less empty space means lower material and shipping costs."],["Production-ready files","Dielines prepared for printing and cutting."]]],
    ["artwork-design","Packaging Artwork Design","Your brand, placed on the structure.","tuck",4,"Send a logo or a rough idea and we place it on the dieline, then refine it until the pack looks right.",[["Artwork on dieline","Your logo and graphics placed on the exact structure."],["Colour guidance","Help choosing Pantone or CMYK colours that print well."],["Print checks","We check bleed, safe areas and resolution before anything goes to press."],["Revisions","Review a proof and request changes before approval."]]],
    ["sample-prototyping","Sample & Prototyping","Hold your packaging before the full run.","gift",5,"Order a physical sample made from your chosen material, so you can check the size, feel and fit with your real product before production.",[["Plain samples","An unprinted sample to test size and structure."],["Printed prototypes","A short printed run to check colours and finishes."],["Fit check","Test the box with your real product and inserts."],["Changes before production","Adjust size or materials before the full order."]]],
    ["digital-proofs","Digital Proofs","See your design before it prints.","mail",1,"Check your design on the pack before anything goes to print. A digital proof shows size, layout and artwork placement.",[["Flat proof","A flat view of the artwork on the dieline."],["3D preview","A 3D view of the finished pack."],["Approval before print","Nothing is printed until you approve the proof."],["Adjustments","We update the design from your feedback."]]]
  ];
  var OPTS = {
    "mat": [
      "Materials",
      [
        [
          "SBS C1S",
          "Bleached white paperboard, coated on one side for high-quality print.",
          0
        ],
        [
          "SBS C2S",
          "Bleached white paperboard, coated on both sides.",
          0
        ],
        [
          "CCNB duplex",
          "Recycled board with a white printing surface.",
          1
        ],
        [
          "Natural kraft",
          "Brown kraft board, an earthy look that prints well in dark inks.",
          1
        ],
        [
          "White kraft",
          "Bleached kraft with a clean surface for colour print.",
          1
        ],
        [
          "Black kraft",
          "Dyed kraft for bold, premium looks.",
          1
        ],
        [
          "Corrugated E-flute",
          "Thin flute for retail-ready boxes with fine print.",
          1
        ],
        [
          "Corrugated B-flute",
          "Thicker flute for shipping strength.",
          1
        ],
        [
          "Textured paper",
          "Wrapping paper with a tactile surface for rigid boxes.",
          0
        ],
        [
          "Metallic paper",
          "A reflective, laminated surface for standout packs.",
          0
        ]
      ]
    ],
    "print": [
      "Printing",
      [
        [
          "Digital print",
          "No plates, so short runs stay affordable.",
          0
        ],
        [
          "Offset print",
          "Best colour consistency and unit price on large runs.",
          0
        ],
        [
          "Pantone matching",
          "Exact brand colours from specific ink formulas.",
          0
        ],
        [
          "Pantone metallic",
          "Metallic spot colours for a rich shine.",
          0
        ],
        [
          "Soy-based ink",
          "Vegetable-oil ink with vivid colour.",
          1
        ],
        [
          "Water-based ink",
          "Low-VOC ink with a lighter footprint.",
          1
        ]
      ]
    ],
    "fin": [
      "Finishes",
      [
        [
          "Hot foil stamping",
          "Metallic foil pressed on with heat, for logos and accents.",
          0
        ],
        [
          "Cold foil",
          "Foil applied with UV adhesive, good for fine detail.",
          0
        ],
        [
          "Blind emboss",
          "Raised detail pressed from behind.",
          0
        ],
        [
          "Blind deboss",
          "Pressed-in detail you can feel.",
          0
        ],
        [
          "Spot UV",
          "Gloss on selected areas against a matte ground.",
          0
        ],
        [
          "Window patch",
          "A film-covered cut-out that shows the product.",
          0
        ]
      ]
    ],
    "coat": [
      "Coatings & lamination",
      [
        [
          "Aqueous coating",
          "Water-based, fast-drying, gloss or matte.",
          1
        ],
        [
          "UV coating",
          "Cured with ultraviolet light for a hard, glossy finish.",
          0
        ],
        [
          "Soft-touch lamination",
          "A velvety surface that resists fingerprints.",
          0
        ],
        [
          "Anti-scratch lamination",
          "Protects dark, heavy-ink designs from scuffs.",
          0
        ],
        [
          "Varnish",
          "Gloss, satin or matte clear coat.",
          0
        ],
        [
          "Matte or gloss lamination",
          "A film layer that adds strength and shine or calm.",
          0
        ]
      ]
    ]
  };
  var MOQROWS = [
    ["Product packaging (folding cartons)","folding-cartons","1,000","boxes","Digital printing can allow lower minimums."],
    ["Corrugated boxes","corrugated-boxes","500","boxes","Shipping and mailer boxes, per design."],
    ["Rigid boxes","rigid-boxes","500","boxes","Gift and premium boxes."],
    ["Paper bags","paper-bags","1,000","bags","Handle type and finish can change the minimum."],
    ["Gusset bags","paper-bags","5,000","bags","Food and retail bags, per size."],
    ["Reusable bags","reusable-bags","1,000","bags","Depends on the fabric and print method."],
    ["Stand-up pouches","pouches","5,000","pouches","Per size, material and design."],
    ["Kraft pouches","pouches","5,000","pouches","Per size and design."],
    ["Floor and counter displays","display-boxes","250","displays","Per design."],
    ["Cardboard inserts","box-inserts","1,000","inserts","Usually ordered with the box they fit."],
    ["Molded pulp inserts","box-inserts","5,000","inserts","Needs a tool, so a higher minimum."],
    ["Food-grade paper inserts","box-inserts","5,000","inserts","Per size and design."],
    ["Food-grade boxes","folding-cartons","2,500","boxes","Food-safe board and coating."],
    ["Cup sleeves","cup-sleeves","5,000","sleeves","Per design."],
    ["Labels and stickers","labels-stickers","1,000","labels","Per design and per size."],
    ["Kraft paper mailers","mailer-bags","5,000","mailers","Per size and design."],
    ["Poly mailers","mailer-bags","5,000","mailers","Per size and design."],
    ["Bubble mailers","mailer-bags","5,000","mailers","Per size and design."],
    ["Recycled bubble mailers","eco-packaging","5,000","mailers","Recycled materials, per size."],
    ["Corporate packaging","corporate-packaging","500","boxes","Per design; one kit can mix several items."],
    ["Packing tape","packing-tape","500","rolls","Printed tape, per design."],
    ["Tissue paper","tissue-paper","5,000","sheets","Printed tissue, per design."],
    ["Food-safe liners","tissue-paper","5,000","sheets","Food-safe paper, per design."],
    ["Card inserts","card-inserts","250","cards","Per design and size."]
  ];
  var PTROWS = [["Product packaging (folding cartons)","folding-cartons","15 to 20"],["Corrugated boxes","corrugated-boxes","15 to 20"],["Rigid boxes","rigid-boxes","25 to 30"],["Box inserts","box-inserts","15 to 20"],["Paper shopping bags","paper-bags","15 to 25"],["Reusable shopping bags","reusable-bags","20 to 25"],["Mailer shipping bags","mailer-bags","15 to 20"],["Flexible pouches","pouches","15 to 20"],["Corporate packaging","corporate-packaging","20 to 25"],["POP displays","display-boxes","25 to 30"],["Stickers and labels","labels-stickers","10 to 15"],["Tissue paper and liners","tissue-paper","15 to 20"],["Packing tape","packing-tape","15 to 20"],["Card inserts","card-inserts","10 to 15"],["Eco-friendly packaging","eco-packaging","15 to 25"],["Cup sleeves","cup-sleeves","15 to 20"]];
  var BLOG = [
    [
      "what-is-a-dieline",
      "What is a dieline, and why does your packaging need one?",
      "The flat template behind every box and bag.",
      [
        "A dieline is the flat template of a package. It shows where the material is cut, where it is folded and how much extra artwork needs to run past the edge so nothing shows white after trimming.",
        "Artwork is placed on the dieline so the print lines up once the box is folded and glued. A logo that looks centred on a flat file can end up across a fold if it is not placed on the real template.",
        "Always ask for a dieline built to the inside size of your product, not a stock size that is close. A few millimetres of difference decides whether the product rattles or fits snugly.",
        "Before anything is printed, check a proof of the artwork on the dieline. It is much cheaper to move a logo on a screen than on ten thousand boxes."
      ]
    ],
    [
      "digital-vs-offset",
      "Digital or offset printing: which suits your order?",
      "Two ways to print, and when each one makes sense.",
      [
        "Digital printing uses no plates. The file goes straight to the press, which makes it a good fit for short runs, several versions of one design and quick samples.",
        "Offset printing uses a plate for each colour. Setting it up costs more, but the price per unit drops as the quantity grows, and it gives very consistent colour, including exact Pantone matches.",
        "A common approach is to start with digital while you test a design and a market, then move to offset once the quantity justifies it.",
        "If colour accuracy is critical to your brand, check the digital proof carefully before you approve it."
      ]
    ],
    [
      "measure-for-a-box",
      "How to measure your product for a custom box",
      "Three numbers and a little room to spare.",
      [
        "Measure the product at its longest, widest and tallest points. Write the numbers in the same order every time: length, width, height. Length and width describe the opening of the box.",
        "Add a small allowance so the product slides in without force. How much depends on the material and style, so ask your packaging supplier what they recommend.",
        "If the product ships with an insert, tissue or a second item, include that in the measurement. Packaging that is too tight is as much of a problem as one that is too loose.",
        "Check the digital proof before a full run. Compare the dimensions with your real product before you approve."
      ]
    ]
  ];
  var LEGAL = {
    "privacy": [
      "Privacy policy",
      [
        "What we collect",
        "Describe what information you collect, such as names, emails and project details from the quote form."
      ],
      [
        "How we use it",
        "Explain how you use that information, for example to prepare quotes and contact customers."
      ],
      [
        "Your choices",
        "Explain how people can ask to see, correct or delete their information."
      ]
    ],
    "terms": [
      "Terms & conditions",
      [
        "Quotes and orders",
        "Explain how quotes work, how long they are valid and how an order is confirmed."
      ],
      [
        "Payment",
        "State your payment methods and terms, such as deposits and balance on shipping."
      ],
      [
        "Returns and claims",
        "Explain what happens if goods arrive damaged or do not match the approved proof."
      ]
    ],
    "shipping": [
      "Shipping policy",
      [
        "Where we ship",
        "List the countries you deliver to, such as the US and the UK."
      ],
      [
        "Carriers and timing",
        "State the couriers or freight options and how delivery estimates are given."
      ],
      [
        "Duties and taxes",
        "Explain who pays import duties and taxes, and how that appears on a quote."
      ]
    ]
  };
  var ADDS = {
    "folding-cartons": [
      "Insert",
      "Plastic Hang Tab",
      "Adhesive Strip"
    ],
    "corrugated-boxes": [
      "Insert",
      "Tape Strip",
      "Hang Tab"
    ],
    "rigid-boxes": [
      "Ribbon",
      "Magnet Closure",
      "Insert"
    ],
    "box-inserts": [],
    "paper-bags": [
      "Ribbon Handle",
      "Rope Handle",
      "Hang Tag"
    ],
    "mailer-bags": [
      "Tear Strip",
      "Extra Seal",
      "Hang Hole"
    ],
    "pouches": [
      "Zip-lock",
      "Tear Notch",
      "Valve"
    ],
    "display-boxes": [
      "Header Card",
      "Shelf Divider",
      "Hang Hole"
    ],
    "labels-stickers": [
      "Sheet Backing",
      "Perforation"
    ],
    "reusable-bags": [
      "Inside Pocket",
      "Zip Closure",
      "Inner Lining"
    ],
    "corporate-packaging": ["Ribbon","Custom Insert","Thank-You Card"],
    "eco-packaging": [
      "Seed Paper Tag",
      "Compostable Window",
      "Recycled Ribbon"
    ],
    "cup-sleeves": [
      "Tear-off Coupon",
      "Window Cut-out",
      "Pre-glued"
    ],
    "packing-tape": [
      "Custom Core",
      "Tamper Pattern",
      "Individual Wrap"
    ],
    "tissue-paper": [
      "Sticker Seal",
      "Gift Pack",
      "Pre-folded Sheets"
    ],
    "card-inserts": [
      "Envelope",
      "Rounded Corners",
      "Foil Edge"
    ]
  };
  var EXTRA_OPTS = ["Foil Stamping","Embossing","Debossing","Window Patching"];
  var BY = {}; CATS.forEach(function (c) { BY[c.s] = c; });
module.exports = { CATS: CATS, BY: BY, IND: IND, SVC: SVC, OPTS: OPTS, MOQROWS: MOQROWS, PTROWS: PTROWS, BLOG: BLOG, LEGAL: LEGAL, ADDS: ADDS, EXTRA_OPTS: EXTRA_OPTS };
