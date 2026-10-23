/* =========================================================
   THE THRIFT HUB — product data
   Apni photos: transparent PNG/WebP (background removed) ko
   assets/img/ mein rakhein aur `img` ka path badal dein.
   `c` = garment ka main colour (card ka halka background isi se banta hai)
   ========================================================= */
const IMG = n => `assets/img/${n}.webp`;
const U = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

window.TH_PRODUCTS = [
  { id: "leather-bomber", name: "Black Leather Bomber", cat: "Jackets", price: 6950, was: 8900, era: "Late 90s", grade: "A", size: "L", c: "#4b4844", img: IMG("leather-bomber"), tag: "Only 1",
    story: "Butter-soft leather with a ribbed hem and cuffs. Broken in by someone who wore it right — zero tears, all zips running smooth.", m: { Chest: "23 in", Length: "26 in", Sleeve: "25 in" } },
  { id: "varsity-leather", name: "Leather Panel Varsity", cat: "Jackets", price: 5850, era: "2000s", grade: "B", size: "M", c: "#464a4d", img: IMG("varsity-leather"), tag: "New",
    story: "Wool body, faux-leather front panels and a cropped boxy fit. Light wear on the cuffs — the good kind.", m: { Chest: "22 in", Length: "24 in", Sleeve: "24 in" } },
  { id: "navy-varsity", name: "Navy Varsity Bomber", cat: "Jackets", price: 4650, was: 5800, era: "2010s", grade: "A", size: "M", c: "#373b47", img: IMG("navy-varsity"), tag: "-20%",
    story: "Striped rib trims, chest patch and a snap front. The classic campus bomber, already broken in.", m: { Chest: "22 in", Length: "25 in", Sleeve: "24 in" } },
  { id: "olive-bomber", name: "Olive Flight Bomber", cat: "Jackets", price: 4250, era: "2000s", grade: "A", size: "XL", c: "#4e5047", img: IMG("olive-bomber"), tag: "",
    story: "MA-1 shape in washed olive nylon with a sleeve pocket. Throw it over anything.", m: { Chest: "25 in", Length: "26 in", Sleeve: "25 in" } },
  { id: "navy-puffer", name: "Midnight Quilt Puffer", cat: "Jackets", price: 5450, era: "2010s", grade: "A", size: "L", c: "#394668", img: IMG("navy-puffer"), tag: "Only 1",
    story: "Light, warm and properly quilted. Reflective piping on the cuffs. Winter sorted.", m: { Chest: "24 in", Length: "28 in", Sleeve: "25 in" } },
  { id: "biker-jacket", name: "Asymmetric Biker", cat: "Jackets", price: 6250, era: "2010s", grade: "A", size: "S", c: "#2b3339", img: IMG("biker-jacket"), tag: "New",
    story: "Off-centre zip, quilted shoulders, sharp collar. Fits close — the way a biker should.", m: { Chest: "20 in", Length: "23 in", Sleeve: "24 in" } },
  { id: "red-harrington", name: "Oxblood Harrington", cat: "Jackets", price: 3950, was: 4900, era: "90s", grade: "B", size: "M", c: "#842831", img: IMG("red-harrington"), tag: "-19%",
    story: "Deep red with a funnel collar and slash pockets. A little sun-fade on one shoulder.", m: { Chest: "22 in", Length: "24 in", Sleeve: "24 in" } },
  { id: "grey-hoodie", name: "Heather Pocket Hoodie", cat: "Hoodies", price: 2850, era: "2010s", grade: "A", size: "M", c: "#696968", img: IMG("grey-hoodie"), tag: "Only 1",
    story: "Slub-knit heather grey with a kangaroo pocket. Soft, light, everyday.", m: { Chest: "21 in", Length: "27 in", Sleeve: "25 in" } },
  { id: "crew-28", name: "Varsity 28 Crewneck", cat: "Hoodies", price: 2450, era: "2000s", grade: "B", size: "S", c: "#7a8080", img: IMG("crew-28"), tag: "",
    story: "Cracked teal 28 print on grey fleece. Small and slightly cropped — great boxy fit.", m: { Chest: "19 in", Length: "21 in", Sleeve: "21 in" } },
  { id: "green-knit", name: "Bottle Green Knit", cat: "Hoodies", price: 2950, era: "2010s", grade: "A", size: "L", c: "#3c5a50", img: IMG("green-knit"), tag: "New",
    story: "Fine-gauge knit in a deep bottle green. Wear alone or over a shirt.", m: { Chest: "22 in", Length: "27 in", Sleeve: "25 in" } },
  { id: "photo-crew", name: "Film Strip Crewneck", cat: "Hoodies", price: 3150, was: 3900, era: "2010s", grade: "A", size: "L", c: "#b49b86", img: IMG("photo-crew"), tag: "-19%",
    story: "Sand fleece with a vintage film-strip print. Heavyweight and oversized.", m: { Chest: "24 in", Length: "26 in", Sleeve: "23 in" } },
  { id: "no-days-off", name: "No Days Off Tee", cat: "Tees", price: 1650, era: "2010s", grade: "A", size: "L", c: "#2a2829", img: IMG("no-days-off"), tag: "Only 1",
    story: "Black tee with a bold split type print. Gym or street, it doesn't take days off.", m: { Chest: "22 in", Length: "28 in" } },
  { id: "mustard-tee", name: "Palm Club Graphic Tee", cat: "Tees", price: 1450, era: "2000s", grade: "B", size: "M", c: "#a18037", img: IMG("mustard-tee"), tag: "",
    story: "Mustard tee with a faded palm-sunset graphic. Washed soft as paper.", m: { Chest: "20 in", Length: "28 in" } },
  { id: "sunset-tee", name: "California Sunset Tee", cat: "Tees", price: 1550, was: 1900, era: "2000s", grade: "A", size: "M", c: "#cdc7c7", img: IMG("sunset-tee"), tag: "-18%",
    story: "Surf-shop graphic on white cotton. Summer in a tee.", m: { Chest: "21 in", Length: "27 in" } },
  { id: "stripe-tee", name: "Breton Stripe Tee", cat: "Tees", price: 1350, era: "2010s", grade: "A", size: "S", c: "#464255", img: IMG("stripe-tee"), tag: "New",
    story: "Navy and rose stripes, boxy cut. Pairs with every denim on the rail.", m: { Chest: "20 in", Length: "25 in" } },
  { id: "flare-denim", name: "70s Flare Denim", cat: "Denim", price: 3850, era: "Y2K", grade: "A", size: "30", c: "#465166", img: IMG("flare-denim"), tag: "Only 1",
    story: "Mid-blue with natural whiskering and a proper flare. Y2K energy, 70s soul.", m: { Waist: "30 in", Inseam: "32 in", Rise: "10 in" } },
  { id: "grey-denim", name: "Washed Grey Slim", cat: "Denim", price: 3250, era: "2010s", grade: "A", size: "32", c: "#464543", img: IMG("grey-denim"), tag: "",
    story: "Washed charcoal denim with a slim taper. Fades only got better.", m: { Waist: "32 in", Inseam: "31 in", Rise: "10 in" } },
  { id: "light-denim", name: "Light Wash Straight", cat: "Denim", price: 2950, was: 3600, era: "90s", grade: "C", size: "34", c: "#848a8e", img: IMG("light-denim"), tag: "-18%",
    story: "Pale ice wash with a frayed hem. A small mark on the left leg — shown in photos, priced in.", m: { Waist: "34 in", Inseam: "30 in", Rise: "11 in" } }
];

window.TH_LIFESTYLE = {
  rack: U("1490481651871-ab68de25d43d", 2000),
  store: U("1441986300917-64674bd600d8", 2000),
  rack2: U("1523381210434-271e8be1f52b", 2000),
  look1: U("1617137968427-85924c800a22"), look2: U("1515886657613-9f3515b0c78f"), look3: U("1552374196-1ab2a1c593e8"),
  look4: U("1529139574466-a303027c1d8b"), look5: U("1509631179647-0177331693ae"), look6: U("1539109136881-3be0616acf4b"),
  look7: U("1558769132-cb1aea458c5e"), flat: U("1434389677669-e08b4cac3105")
};

window.TH_INSTAGRAM = "https://www.instagram.com/the__thrifthub";
window.TH_WHATSAPP = ""; // e.g. "923001234567"
