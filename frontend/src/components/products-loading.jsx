export default function ProductsLoading() {
    return (
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="col" key={i}>
            <div className="card h-100">
              <div className="placeholder-glow">
                <div className="placeholder" style={{ height: "200px", width: "100%" }}></div>
              </div>
              <div className="card-body">
                <h5 className="card-title placeholder-glow">
                  <span className="placeholder col-6"></span>
                </h5>
                <p className="card-text placeholder-glow">
                  <span className="placeholder col-7"></span>
                  <span className="placeholder col-4"></span>
                  <span className="placeholder col-4"></span>
                  <span className="placeholder col-6"></span>
                </p>
                <div className="placeholder-glow mt-auto">
                  <span className="placeholder col-3"></span>
                  <span className="placeholder col-8 mt-2"></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  