// Local browser regression checks. Firebase writes are mocked, never sent.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const origin = process.env.SHOP_TEST_URL || 'http://127.0.0.1:4173';
const mock = `
export const getFirestore=()=>({});
export const collection=(db,path)=>({path});
export const doc=(db,path,id)=>({path,id});
export const orderBy=()=>({});
export const query=(ref)=>ref;
export const serverTimestamp=()=>({seconds:1});
const docs={products:[
 {id:'prod-one',data:()=>({name:'Chemisier Alpha',slug:'chemisier',category:'Homme',subcategory:'Chemisier',price:1000,sizes:['6XL','4XL','S','M','68','60'],image:'/test-portrait.svg',images:['/test-portrait.svg','/test-wide.svg']})},
 {id:'prod-two',data:()=>({name:'Chemisier Beta',slug:'chemisier',category:'Homme',subcategory:'Chemisier',price:2000,sizes:['S'],image:'/test-wide.svg',images:['/test-wide.svg']})}
],shipping:[{id:'16',data:()=>({code:'16',home:700,office:350,active:true})}]};
export function onSnapshot(ref,next,error){const timer=setTimeout(()=>next({docs:docs[ref.path]||[]}),200);return()=>clearTimeout(timer)}
export async function addDoc(ref,data){window.__writes??=[];window.__writes.push({path:ref.path,data});await new Promise(r=>setTimeout(r,350));if(window.__failWrite)throw new Error('offline');return{id:'test-write'}}
export async function getDoc(){return{exists:()=>false}}
export const deleteDoc=async()=>{};
export const updateDoc=async()=>{};
export const setDoc=async()=>{};
`;
(async()=>{
  const browser=await chromium.launch({headless:true, channel:'chrome'});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    await context.route('**/firebase_firestore.js*',route=>route.fulfill({contentType:'application/javascript',body:mock}));
    await context.route('**/test-*.svg',route=>route.fulfill({contentType:'image/svg+xml',body:route.request().url().includes('portrait')?'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="900"><rect width="300" height="900" fill="#e5dacb"/><rect x="5" y="5" width="290" height="890" fill="none" stroke="#4e1f4d" stroke-width="10"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300"><rect width="900" height="300" fill="#cbd8ce"/></svg>'}));
    const page=await context.newPage(), errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/collections/nos-patrons');
    await page.getByText('2 modèles disponibles').waitFor();
    const alpha=page.getByRole('link',{name:'Chemisier Alpha',exact:true});
    assert.match(await alpha.getAttribute('href'),/id=prod-one/);
    await alpha.click();
    await page.getByRole('heading',{name:'Chemisier Alpha'}).waitFor();
    const frame=await page.locator('.product-image-frame').boundingBox();
    assert.equal(frame.width,500);assert.equal(frame.height,500);
    assert.equal(await page.locator('.product-image-frame img').evaluate(img=>getComputedStyle(img).objectFit),'contain');
    assert.equal(await page.locator('.product-image-frame img').evaluate(img=>img.complete && img.naturalWidth>0),true);
    await page.getByRole('button',{name:'Voir la photo 2',exact:true}).click();
    assert.match(await page.locator('.product-image-frame img').getAttribute('src'),/wide/);
    assert.deepEqual(await page.locator('.size-choice').allTextContents(),['S','M','4XL','6XL','60','68']);
    await page.getByRole('button',{name:'S',exact:true}).click();
    await page.getByRole('button',{name:/Placement sur mesure/}).click();
    await page.getByLabel('Largeur du tissu').fill('-1');await page.getByLabel('Longueur de la table').fill('180');
    await page.locator('.product-add').click();assert.match(await page.locator('[role=alert]').innerText(),/supérieures à zéro/);
    await page.getByRole('button',{name:/Imprimé par taille/}).click();
    await page.locator('.product-add').click();
    await page.locator('.cart .close').click();
    await page.getByRole('link',{name:'Retour aux patrons',exact:true}).click();
    await page.getByRole('link',{name:'Chemisier Beta',exact:true}).click();
    await page.getByRole('heading',{name:'Chemisier Beta'}).waitFor();
    assert.equal(await page.locator('.size-choice.selected').count(),0);
    await page.getByRole('button',{name:'S',exact:true}).click();await page.getByRole('button',{name:/Imprimé par taille/}).click();await page.locator('.product-add').click();
    assert.equal(await page.locator('.cart .line').count(),2);
    await page.getByRole('link',{name:/Passer au checkout/}).click();
    await page.getByRole('button',{name:'Confirmer la commande'}).waitFor();
    await page.waitForFunction(()=>!document.querySelector('.checkout-submit').disabled);
    assert.match(await page.locator('.checkout-confirm-total').innerText(),/3.?700/);
    await page.getByRole('button',{name:/Au bureau/}).click();
    await page.locator('.form-grid select').selectOption('37');
    assert.match(await page.locator('.delivery-options .chosen').innerText(),/domicile/);
    assert.equal(await page.getByRole('button',{name:/Au bureau/}).isDisabled(),true);
    await page.locator('.form-grid select').selectOption('16');
    await page.getByLabel('Prénom',{exact:true}).fill('Test');await page.getByLabel('Nom',{exact:true}).fill('Client');await page.getByLabel('Téléphone',{exact:true}).fill('0775263366');await page.getByLabel('Adresse complète').fill('Adresse test');
    await page.evaluate(()=>{window.__failWrite=true});
    await page.locator('.checkout-submit').click();await page.getByRole('alert').waitFor();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('patron-cart')).length),2);
    await page.evaluate(()=>{window.__failWrite=false;window.__writes=[];window.scrollTo(0,500)});
    await page.locator('.checkout-submit').click();
    await page.getByRole('heading',{name:'Merci pour votre commande.'}).waitFor();
    assert.equal(await page.evaluate(()=>window.__writes.length),1);
    assert.equal(await page.evaluate(()=>window.__writes[0].data.shipping),700);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('patron-cart')).length),0);
    assert.equal(await page.evaluate(()=>window.scrollY),0);
    await page.getByRole('link',{name:'Contact',exact:true}).click();
    await page.getByLabel('Nom complet').fill('Test');await page.getByLabel('Téléphone',{exact:true}).fill('0775263366');await page.getByLabel('Votre message').fill('Message de vérification');await page.getByRole('button',{name:'Envoyer le message'}).click();await page.getByText('Votre message a bien été envoyé.').waitFor();
    assert.equal(await page.evaluate(()=>window.__writes.at(-1).path),'messages');
    await page.goto(origin+'/admin/login');await page.locator('.admin-login').waitFor();
    for(const width of [390,768,1440]){
      await page.setViewportSize({width,height:900});await page.goto(origin+'/products/chemisier?id=prod-one');await page.getByRole('heading',{name:'Chemisier Alpha'}).waitFor();
      const box=await page.locator('.product-image-frame').boundingBox();assert.ok(Math.abs(box.width-box.height)<1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
      await page.screenshot({path:path.join(__dirname,'../qa-product-'+width+'.png'),fullPage:true});
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: full images at 390/768/1440px, thumbnails, duplicate slugs, size reset/order, cart totals, live shipping, office unavailable, write failure, order success/clear/scroll, contact and admin login; no runtime errors.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
