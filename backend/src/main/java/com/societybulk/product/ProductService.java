package com.societybulk.product;

import com.societybulk.product.dto.ProductRequest;
import com.societybulk.product.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getAllAvailableProducts() {
        return productRepository.findByAvailableTrue().stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    public ProductResponse getProductById(Long id) {
        Product product = getProductEntity(id);
        return ProductResponse.fromEntity(product);
    }

    public Product getProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory().trim())
                .unit(request.getUnit().trim())
                .retailPrice(request.getRetailPrice())
                .wholesalePrice(request.getWholesalePrice())
                .available(request.getAvailable() == null || request.getAvailable())
                .build();

        Product saved = productRepository.save(product);
        return ProductResponse.fromEntity(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = getProductEntity(id);

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription().trim());
        product.setCategory(request.getCategory().trim());
        product.setUnit(request.getUnit().trim());
        product.setRetailPrice(request.getRetailPrice());
        product.setWholesalePrice(request.getWholesalePrice());
        if (request.getAvailable() != null) {
            product.setAvailable(request.getAvailable());
        }

        Product updated = productRepository.save(product);
        return ProductResponse.fromEntity(updated);
    }

    @Transactional
    public ProductResponse deactivateProduct(Long id) {
        Product product = getProductEntity(id);
        product.setAvailable(false);
        Product updated = productRepository.save(product);
        return ProductResponse.fromEntity(updated);
    }

}
