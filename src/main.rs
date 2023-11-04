use std::{collections::HashMap, fs, rc::Rc};

use askama::Template;
use serde::{Deserialize, Serialize};

#[derive(Clone, Deserialize)]
struct Db<'a> {
    #[serde(borrow)]
    categories: HashMap<&'a str, Category<'a>>,
    #[serde(borrow)]
    words: HashMap<&'a str, WordInfo<'a>>,
}

#[derive(Clone, Deserialize)]
struct Category<'a> {
    label: &'a str,
    icon_src: &'a str,
    words: Rc<[&'a str]>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct WordInfo<'a> {
    label: &'a str,
    img_src: &'a str,
    audio_src: &'a str,
}

#[derive(Template)]
#[template(path = "categories.html")]
struct CategoriesTemplate<'a> {
    categories: HashMap<&'a str, Category<'a>>,
}

#[derive(Template)]
#[template(path = "player.html")]
struct PlayerTemplate<'a> {
    words: Rc<[WordInfo<'a>]>,
}

fn main() {
    let db = std::fs::read_to_string("./db/db.json").expect("could not load db file");
    let db: Db = serde_json::from_str(&db).expect("could not parse db file");
    let categories = db.categories;

    let _ = fs::remove_file("./index.html");
    let _ = fs::remove_dir_all("./categories/");
    fs::create_dir_all("./categories").unwrap();

    for category in categories.keys() {
        let words = categories[category]
            .words
            .iter()
            .map(|word| db.words[word].to_owned())
            .collect();
        let page = PlayerTemplate { words }
            .render()
            .expect("could not render page for category '{category}'");
        fs::write(format!("./categories/{category}.html"), page)
            .expect("Unable to write file for category '{category}'");
    }
    let category_page = CategoriesTemplate { categories }
        .render()
        .expect("could not render category page");
    fs::write("./index.html", category_page).expect("Unable to write category file");
}
