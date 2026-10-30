import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import exifr from "exifr"
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import { saveAs } from "file-saver"
import ImgCard from "./components/ImgCard";

function App() {
  const [fileChosen, setFileChosen] = useState(false);

  const [data, setData] = useState([]);

  async function handleFileChange(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const tempArr = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      let date;
      try {
        const exif = await exifr.parse(file, ["DateTimeOriginal"]);
        date = exif?.DateTimeOriginal ?? new Date(file.lastModified);
      } catch {
        date = new Date(file.lastModified);
      }

      const buffer = await file.arrayBuffer();

      const bitmap = await createImageBitmap(file, {
        resizeWidth: 550,
        resizeQuality: 'high'
      });
      let finalW = bitmap.width;
      let finalH = bitmap.height;
      bitmap.close();

      const maxH = 550;
      if (finalH > maxH) {
        const scale = maxH / finalH;
        finalW = Math.round(finalW * scale);
        finalH = Math.round(finalH * scale);
      }

      tempArr.push({
        id: tempArr.length + 1,
        name: file.name.substring(0, file.name.lastIndexOf(".")),
        dateCreation: date.toLocaleString("pl-PL"),
        file: file,
        preview: URL.createObjectURL(file),
        buffer: buffer,
        width: finalW,
        height: finalH
      });
    }

    //tempArr.sort((a, b) => a.name.localeCompare(b.name));

    setData(tempArr);
    setFileChosen(true);
  }

  async function generateDocx(data){
    const childrenArr = [];

    for (const [i, item] of data.entries()) {
      childrenArr.push(
        new Paragraph({
          children: [
            new TextRun({text: "Nazwa obrazka: ", bold: true}),
            new TextRun(item.name)
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "Data i godzina utworzenia: ", 
              bold: true
            }),
            new TextRun(item.dateCreation)
          ]
        }),
        new Paragraph({
          children: [
            new ImageRun({
              data: item.buffer,
              type: "jpg",
              transformation: {width: item.width, height: item.height}
            })
          ]
        }),
        new Paragraph({
          pageBreakBefore: i !== data.length - 1 ? true : false
        })
      )
    }

    const doc = new Document({
    sections: [
      {
        children: childrenArr
      }
    ]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "album-zdjec.docx");

  }

  return (
    <>
      <header>
        <h1>
          Generator albumu zdjęć
        </h1>
        <p>
          Stwórz album ze swoich zdjęć w kilka chwil!
          Wybierz folder zawierający fotografie, a aplikacja
          automatycznie przygotuje dokument z obrazami, ich nazwami
          oraz datami wykonania.
        </p>
      </header>
      <main className="border-bottom border-top p-5">
        <div className="row">
          <div className="col-2">

          </div>
          <div className="col-md-8">
            <label htmlFor="formFileMultiple" className="btn btn-primary">Wybierz folder z plikami</label>
            <input type="file" id="formFileMultiple" webkitdirectory="" multiple
              className="d-none" accept=".jpg"
              onChange={handleFileChange} />
          </div>
          <div className="col-2">
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-2">

          </div>
          <div className="col-8 overflow-y-auto" style={{ maxHeight: "40vh" }}>
            {data.map((item) => (
              <ImgCard
                key={item.id}
                name={item.name}
                dateCreation={item.dateCreation}
                preview={item.preview} />
            ))}
          </div>
          <div className="col-2">

          </div>
        </div>
        <div className="row mt-5">
          <div className="col-2">

          </div>
          <div className="col-8">
            {fileChosen && 
            <button type="button" 
              className="btn btn-primary"
              onClick={() => generateDocx(data)}
            >
              Wygeneruj plik .docx
            </button>
            }
          </div>
          <div className="col-2">

          </div>
        </div>
      </main>
      <footer>
        <p>Generator albumu zdjęć © {new Date().getFullYear()}</p>
      </footer>
    </>
  )
}

export default App
