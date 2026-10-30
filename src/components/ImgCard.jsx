function ImgCard({ name, dateCreation, preview }) {
    return (
        <div>
            <img src={preview} alt={name} className="img-fluid" loading="lazy" />
            <p>
                Nazwa pliku: {name} 
                <br/>
                Data stworzenia: {dateCreation}
            </p>
        </div>
    )
}

export default ImgCard;